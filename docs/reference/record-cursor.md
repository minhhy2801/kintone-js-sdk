# Record Cursor

Provide functions to work with kintone Cursor

Currently there's only cursor for records.

## Constructor

**Parameter**

| Name| Type| Required| Description |
| --- | --- | --- | --- |
| connection | [Connection](../connection) | (optional) | The connection module of this SDK. If initializing in browser environment on kintone, this parameter can be ommited to use session authentication.

**Sample code**

<details class="tab-container" open>
<Summary>Init Record Cursor module</Summary>

<strong class="tab-name">Javascript</strong>

<pre class="inline-code">

    (function(kintoneJSSDK) {
        'use strict';
        const kintoneConnection = kintoneJSSDK.Connection;
        const kintoneRecordCursorModule = kintoneJSSDK.RecordCursor;
        
        // Init Connection
        const conn = new kintoneConnection();
        
        // Init RecordCursor module
        const kintoneRC = new kintoneRecordCursorModule(conn)
            
        //...
    }(window.kintoneJSSDK));

</pre>

<strong class="tab-name">Nodejs</strong>

<pre class="inline-code">

    const kintone = require('@kintone/kintone-js-sdk');
 
    const username = 'YOUR_USERNAME';
    const password = 'YOUR_PASSWORD';
    const domain = 'YOUR_DOMAIN';
    const appID = YOUR_APP_ID;
    
    const kintoneAuth = (new kintone.Auth()).setPasswordAuth(username, password);
    const kintoneConn = new kintone.Connection(domain, kintoneAuth);
    
    const kintoneRC = new kintone.RecordCursor(kintoneConn);

</pre>

</details>

## Methods

### createCursor(app, fields, query, size)

> Create a cursor.

**Parameter**

| Name| Type| Required| Description |
| --- | --- | --- | --- |
| app | Integer | yes | The kintone app ID
| fields | Array<String\> | (optional) | List of field codes you want in the response.
| query | String | (optional) | [The query string](https://developer.kintone.io/hc/en-us/articles/213149287#getrecords) that will specify what records will be responded.
| size | Integer | (optional) | Number of records to retrieve per request. <br> Default: 100. <br>Maximum: 500.

**Return**

Promise&lt;CreateCursorResponse&gt; Cursor Object from kintone. 

| Name| Type| Description |
| --- | --- | --- |
| id | String | The cursor ID
| totalCount | Integer | The total count of records that match the query conditions

### getRecords(cursorID)

> Get one block of records.

**Parameter**

| Name| Type| Required| Description |
| --- | --- | --- | --- |
| cursorID | String | yes | Cursor ID

**Return**

Promise&lt;GetRecordCursorResponse&gt;

| Name| Type| Description |
| --- | --- | --- |
| records | Array | The array of records data
| next | Boolean | Show if there's more records to get from kintone for cursor.

### getAllRecords(cursorID)

> Get all records 

**Parameter**

| Name| Type| Required| Description |
| --- | --- | --- | --- |
| cursorID | String | yes | Cursor ID

**Return**

Promise&lt;GetRecordsResponse&gt;