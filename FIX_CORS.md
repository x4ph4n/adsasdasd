# How to Fix Image Upload (CORS Error)

The "blocked by CORS policy" error happens because Firebase Storage is secure by default and doesn't allow websites (like your `localhost:3000`) to upload or modify files unless explicitly allowed.

I have created a `cors.json` file in your project root. You need to apply this configuration to your Firebase Storage bucket.

## Option 1: Using Google Cloud Console (Web Browser)
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Select your project: `canteen-app-71b0a`.
3. Activate the **Cloud Shell** (icon in the top right toolbar, looks like `>_`).
4. In the shell, create the cors file:
   ```bash
   echo '[{"origin": ["*"],"method": ["GET", "PUT", "POST", "DELETE", "HEAD"],"maxAgeSeconds": 3600}]' > cors.json
   ```
5. Apply it to your bucket:
   ```bash
   gsutil cors set cors.json gs://canteen-app-71b0a.appspot.com
   ```

## Option 2: Using GSUtil (If installed)
If you have the Google Cloud SDK installed locally:
1. Open your terminal in this project folder.
2. Run:
   ```powershell
   gsutil cors set cors.json gs://canteen-app-71b0a.appspot.com
   ```

After doing this, the image upload feature in the Admin Dashboard will work.
