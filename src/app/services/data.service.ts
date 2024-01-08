import {Injectable} from '@angular/core';
import {createClient, SupabaseClient, RealtimeChannel, PostgrestSingleResponse} from "@supabase/supabase-js";
import {environment} from "../../environments/environment";
import {Subject} from "rxjs";
import {ChestUI, ParsedChest} from "../models/parsed-chest";

const GROUPS_DB = 'groups'
const MESSAGES_DB = 'messages'
const CHEST_DB = 'chest'
const PLAYER_DB = 'player'
const CHEST_TYPE_DB = 'chest_type'
const CLAN_DB = 'clan'

let playersList: Player[] = [];
let chestTypeList: ChestType[] = [];

export interface Message {
    created_at: string
    group_id: number
    id: number
    text: string
    user_id: string
}

export interface Player {
    id: number
    name: string
    active: boolean
    might: number
}

export interface ChestType {
    id: number
    source: string
}

export interface User {
    id: number,
    email: string
}

@Injectable({
    providedIn: 'root'
})
export class DataService {
    private supabase: SupabaseClient;
    private realtimeChannel!: RealtimeChannel;

    constructor() {
        this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey)
        this.setEnums();
    }

    setEnums() {
        this.getPlayer();
        this.getChestTypes();
        console.log(playersList);
        console.log(chestTypeList);
    }

    async getPlayer(){
        const players = await this.supabase.from(PLAYER_DB).select(`id, name, active, might`);
        if (players.data != null) {
            playersList = players.data;
        }
    }

    async getChestTypes(){
        const chest_types = await this.supabase.from(CHEST_TYPE_DB).select(`id, source`);

        if (chest_types.data != null) {
            chestTypeList = chest_types.data;
        }
    }

    async getChests() {
        const result = await this.supabase
            .from(CHEST_DB)
            .select(`title,id, source, level, player:player_id ( name ), chest_type:chest_type_id(source), user:uploaded_by(email), created_at`);
        return result.data;
    }

    async insertChests(parsedData: ParsedChest[]) {
        const user = await this.supabase.auth.getUser();

        if (user !== null && user !== undefined && user.data !== null && user.data.user !== null) {
            for (const chest of parsedData) {

                const newChest: ChestUI = {
                    title: chest.title,
                    source: chest.chestType,
                    level: chest.level,
                    player_name: chest.player,
                    uploaded_by: user.data.user.id,
                };

                console.log("chestObject to send:", newChest);
                this.createChest(newChest);
            }
        } else {
            console.log("getUser devolvio null");
        }
    }

    async insertPlayer(name: string): Promise<number> {
        const clan_id = 1; // Replace with the actual clan ID
        const might = 0;   // Replace with the actual might value

        const { data, error } = await this.supabase.rpc('insert_or_get_player', { player_name: name, clan_id, might }) as PostgrestSingleResponse<any>;

        if (error || !data) {
            console.error('Error inserting or getting player:', error?.message);
            throw new Error('Failed to insert or get player.');
        }

        // Return the ID of the player (either existing or newly created)
        return data;
    }

    async insertChestType(chest_type: string): Promise<number> {
        const { data, error } = await this.supabase.rpc('insert_or_get_chest_type', { p_chest_source: chest_type}) as PostgrestSingleResponse<any>;

        if (error || !data) {
            console.error('Error inserting or getting chest type:', error?.message);
            throw new Error('Failed to insert or get chest type.');
        }

        // Return the ID of the chest type (either existing or newly created)
        return data;
    }

    async createChest(newchest: ChestUI) {
        //await this.supabase.from(CHEST_DB).insert(newchest).single();
        await this.supabase.rpc('insert_chest_with_player_and_type', {
            p_player_name: newchest.player_name,
            p_clan_id: 1,  // Replace with the actual clan ID
            p_might: 0,    // Replace with the actual might value
            p_guards_lvl: 5,    // Replace with the actual might value
            p_specialists_lvl: 5,    // Replace with the actual might value
            p_monsters_lvl: 5,    // Replace with the actual might value
            p_chest_source: newchest.source,
            p_chest_level: newchest.level,
            p_chest_title: newchest.title,
            p_uploaded_by: newchest.uploaded_by
        });
    }

    getPlayerIdByName(name: string): number | undefined {
        const player = playersList.find(player => player.name === name);

        return player ? player.id : undefined;
    }

    private async getPlayerByName(name: string): Promise<{ id: number } | null> {
        const { data, error } = await this.supabase.from(PLAYER_DB).select('id').eq('name', name).single();

        if (error) {
            console.error('Error fetching player:', error.message);
            throw new Error('Failed to fetch player.');
        }

        return data ? data : null;
    }

    async getPlayerStats() {
        const result = await this.supabase.rpc('get_player_stats');
        return result.data;
    }

    async addGroupMessage(groupId: any, message: any) {
        const user = await this.supabase.auth.getUser();
        if (user !== null) {
            const newMessage = {
                text: message,
                user_id: user.data.user?.id,
                group_id: groupId,
            };
            console.log('NEW: ', newMessage);
            return this.supabase.from(MESSAGES_DB).insert(newMessage);
        } else {
            console.log("getUser devolvio null");
            return null;
        }
    }

    getGroupMessages(groupId: any) {
        // TODO: Limit and sort
        return this.supabase
            .from(MESSAGES_DB)
            .select(`created_at, text, id, users:user_id ( email, id )`)
            .match({group_id: groupId})
            .limit(25)
            .then((result) => result.data);
    }

    listenToGroup(groupId: string | number) {
        const changes = new Subject();

        this.realtimeChannel = this.supabase
            .channel('public:messages')
            .on('postgres_changes', {event: '*', schema: 'public', table: 'messages'}, async (payload) => {
                console.log('DB CHANGE: ', payload);

                if (payload.new && (payload.new as Message).group_id === +groupId) {
                    const msgId = (payload.new as Message).id;
                    console.log('load message: ', msgId);

                    const msg = await this.supabase
                        .from(MESSAGES_DB)
                        .select(`created_at, text, id, users:user_id ( email, id )`)
                        .match({id: msgId})
                        .single()
                        .then((result) => result.data);
                    changes.next(msg);
                }
            })
            .subscribe();

        return changes.asObservable();
    }

    unsubscribeGroupChanges() {
        if (this.realtimeChannel) {
            console.log('REMOVE CHANNEL');
            this.supabase.removeChannel(this.realtimeChannel);
        }
    }
}
