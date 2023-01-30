import { connect } from '@planetscale/database'
import axios from 'axios'

export async function handler(event, context) {
  try {
    const config = {
      host: process.env.DBHOST,
      username: process.env.DBUSER,
      password: process.env.DBPASS
    }
    
    const conn = connect(config)
    let results = await conn.execute("select value from configs where configKey = 'msgraph'")
    const { refresh_token } = results.rows[0].value
    console.log(refresh_token)

    let data = `client_id=${process.env.OFFICE_CLIENT_ID}`
    data += `&scope=offline_access user.read tasks.readwrite`
    data += `&refresh_token=${refresh_token}`
    data += `&grant_type=refresh_token`
    data += `&client_secret=${process.env.OFFICE_CLIENT_SECRET}`

    let res = await axios({
      url: `https://login.microsoftonline.com/${process.env.OFFICE_TENANT_ID}/oauth2/v2.0/token`,
      method: "post",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      data
    })

    const responseBody = JSON.stringify(res.data)
    console.log(responseBody)
    
    const query = `insert into configs (configKey, value) values ('msgraph', ?) 
      on duplicate key update value = ?`
    await conn.execute(query, [responseBody, responseBody])

    return {
      statusCode: 200
    }
  } catch (err) {
    console.log(err)
    return {
      statusCode: 500
    }
  }
}
