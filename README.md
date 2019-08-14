**globe-api**
----
  Realtime topics based on the location

* **Endpoint:**
  /topics/:appid/:lat/:long

* **Method:**
  `GET`
  
*  **URL Params**

   **Required:**
 
   `appid` - authorized application id
   `lat` - latitude
   `long` - longitude

* **Success Response:**

  ```
  	{
  		"status":200,
  		"topics":
  			[
  			  {"word":"クリスマスボックス","point":117638},
  			  {"word":"最終日","point":75148},
  			  {"word":"直筆メッセージ","point":74423},
  			  {"word":"忘年会","point":52439},
  			  ...
  			  {"word":"機能不全","point":0}
  			  ],
  			  "location":"Tokyo",
  			  "totalPoint":591362
  	}
  ```
 
* **Error Response:**

   ```
  	{
  		"status":401,
  		"message":"Unauthorized appid"
  	}
  ```
