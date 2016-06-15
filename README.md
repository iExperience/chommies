ixChommies API
======

All requests require your API token as a URL parameter in the form `token=yourTokenHere`.

`GET \props` returns a feed of the most recent props

`POST \props` adds some props. Parameters are:
  - `for` needs to be the id of a user
  - `props` must contain the text of the props

`GET \props\me` returns a list of all props you've received

`GET \brus` returns a list of all brus
