export interface UserData {
    email: string;
    password: string;
    remember: boolean;
}

export interface ArticleData {
    title: string;
    thumbnail: any;
    content: string;
}

export interface MyPayload {
    'id': string;
    'email': string;
}