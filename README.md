ixChommies API
======

All requests require your API token as a URL parameter in the form `token=yourTokenHere`.

`GET \props` returns a feed of the most recent props
Example url to get recent props: `/props?token=myTOken`
The returned Prop object has the following properties:
  id: int
  receiver object: {first_name, id, last_name}
  created_at: datetime
  text: string
  positivity_score: double

`POST \props` adds some props. Parameters are:
  - `for` needs to be the id of a user
  - `props` must contain the text of the props
Example url to add a prop: `/props?token=myToken&for={userID}&props=you%20rock`

`GET \props\me` returns a list of all props you've received

`GET \brus` returns a list of all brus
The returned Bru object has the following properties:
  id: int
  first_name: string
  last_name: string
  picture_url: string
