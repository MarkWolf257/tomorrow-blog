export interface UserData {
    name: string;
    email: string;
    password: string;
    remember: boolean;
}

export interface UserProfile {
    name: string;
    description: string;
}

export interface ArticleData {
    title: string;
    thumbnail: any;
    content: string;
}

export interface MyPayload {
    id: string;
    email: string;
}