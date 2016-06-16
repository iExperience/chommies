ixChommies API
======

All requests require your API token as a URL parameter in the form `token=yourTokenHere`.

`GET http://ixchommies.herokuapp.com/props` returns a feed of the most recent props
Example url to get recent props: `/props?token=myTOken`
The returned Prop object has the following properties:
```
{
  receiver: {first_name: string, last_name: string},
  created_at: datetime,
  text: string,
  positivity_score: double
}
```

`POST http://ixchommies.herokuapp.com/props` adds some props. Parameters are:
  - `for` needs to be the id of a user
  - `props` must contain the text of the props
Example url to add a prop: `/props?token=myToken&for=aPersonId&props=you%20rock`

`GET http://ixchommies.herokuapp.com/props/me` returns a list of all props you've received

`GET http://ixchommies.herokuapp.com/brus` returns a list of all brus
The returned Bru object in the format:
```
{
  first_name: string,
  last_name: string,
  picture_url: string
}
```
