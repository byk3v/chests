export interface ParsedChest {
    title: string;
    player: string;
    chestType: string;
    level: number |null;
}

export interface ChestType {
    level: number | null;
    chestType: string;
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

export interface ClanBD {
    id: number
    name: string
}

export interface ChestTypeBD {
    id: number
    source: string
}

export interface PlayerBD {
    id: number
    name: string
    clan: ClanBD
    might: string
    active: boolean
}

export interface ChestBD {
    id: number
    title: string
    source: string
    level: number | null
    player: PlayerBD
    chest_type_id: ChestTypeBD
    uploaded_by: User
    created_at: Date
}

export interface ChestUI {
    title: string
    source: string
    level: number | null
    player_name: string
    uploaded_by: string
}

export interface User {
    id: number,
    email: string
}