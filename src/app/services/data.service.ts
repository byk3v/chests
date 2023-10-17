import {Injectable} from '@angular/core';
import {createClient, SupabaseClient, RealtimeChannel} from "@supabase/supabase-js";
import {environment} from "../../environments/environment";
import {Subject} from "rxjs";
import {ChestUI, ParsedChest} from "../models/parsed-chest";

const GROUPS_DB = 'groups'
const MESSAGES_DB = 'messages'
const CHEST_DB = 'chest'
const PLAYER_DB = 'player'
const CLAN_DB = 'clan'

export interface Message {
  created_at: string
  group_id: number
  id: number
  text: string
  user_id: string
}

export interface Message2 {
  created_at: string
  id: number
  text: string
  users: User
}

export interface Group {
  id: number
  title: string
  users: User
  created_at: string
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
  }

  getChests() {
    return this.supabase
        .from(CHEST_DB)
        .select(`title,id, source, level, player:player_id ( name ), chest_type:chest_type_id(source), user:uploaded_by(email), created_at`)
        .then((result) => result.data)
  }

  async createChest(parsedChest: ParsedChest) {
    const user = await this.supabase.auth.getUser();
    if (user !== null && user !== undefined && user.data !== null && user.data.user !== null) {

      const newchest: ChestUI = {
        title: parsedChest.title,
        source: parsedChest.type,
        level: 5,
        player_id: 1,
        chestType: 1,
        uploaded_by: parseInt(user.data.user.id),
      };
      console.log("entro a crear chest, chest:", newchest);
      return this.supabase.from(GROUPS_DB).insert(newchest).select().single();
    } else {
      console.log("getUser devolvio null");
      return null;
    }
  }

  getGroupById(id: any) {
    return this.supabase
        .from(GROUPS_DB)
        .select(`created_at, title, id, users:creator ( email, id )`)
        .match({id})
        .single()
        .then((result) => result.data);
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
