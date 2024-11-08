namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    PORT: string;
    MONGO_URI: string;
    JWT_TOKEN: string;
    EMAIL_ID: string;
    EMAIL_PASS: string;
    GOOGLE_CLIENT_ID: string;
    VERSION: string;
    PHONE_NUMBER_ID: string;
    ACCESS_TOKEN: string;
    EXPENSE_CATEGORY_ID: string;
    
    WA_API_ENDPOINT: string;
    WA_VERSION: string;
    WA_SELECTED_PHONE_NUMBER_ID: string;
    WA_BEARER_TOKEN: string;

    TASK_MANAGER_TOKEN:string,
    TASK_MANAGER_URL:string;

    FCM_TASK_TOKEN:string
    WA_CALLBACK_VERIFY_TOKEN:string
    GOOGLE_MAPS_KEY:string
  }

}
