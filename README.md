### Langlebigen Page Access Token abrufen

https://developers.facebook.com/docs/facebook-login/guides/access-tokens/get-long-lived

1. Mit Short lived user token einen Long lived user token erzeugen
2. Mit dem long lived user token einen page token anfordern

### Instagram page ID abrufen

1. Facebook page ID abrufen
   /me/accounts
   id unter dem seiten namen ist die facebook page ID

2. Verknüpften Instagram business account abrufen
   /{facebook-page-id}?fields=instagram_business_account
   gibt die instagram page id des verknüpften ig accounts zurück

### Firebase storage signed URL abrufen

Die admin SDK muss mit einem Service Account Key file initialisiert werden. Der Weg per ACL (Application Default Credentials) mit der gcloud cli reicht nicht aus.
