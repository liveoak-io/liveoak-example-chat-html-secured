Secured chat
============
Features
--------
* HTTP REST including authentication and authorization. Keycloak integration

* Stomp over websockets used for subscription requests. Subscription requests allowed just for authorized users (members of role 'admin' or role 'user')

* Authorized subscription responses received for newly added chat messages and also for deleted or updated messages. (Update of messages is not provided by this example, but is possible through Liveoak admin console)

* Users with role _admin_ can delete any chat message. So administrator is allowed to censor everything. Normal users can delete just their own messages.

Steps to run the application
----------------------------
* Copy the example in the _apps_ directory and start Liveoak

	$ cp -r _liveoak examples_/chat-html-secured _liveoak_/apps
	$ sh _liveoak_/bin/standalone.sh

* Add the application in keycloak (Manual step currently required)

 * Go to http://localhost:8080/auth/admin/index.html#/realms/liveoak-apps/applications
 * Add Application
   * Name: "chat-html-secured"
   * client-type: "public"
   * Redirect URI: "http://localhost:8080/chat-html-secured/*" (click button "Add") 
   * Admin URL: "http://localhost:8080/chat-html-secured"
   * Web Origins: "http://localhost:8080" (click button "Add")
 * Finally click "Save"

* Create roles for newly created application (Manual step required)
  * Go to http://localhost:8080/auth/admin/liveoak-admin/console/index.html#/realms/liveoak-apps/applications/chat-html-secured/roles
  * Add Role > Role name: "admin" > Click "Save"
  * Repeat the same and add also role "user"
  * When you open http://localhost:8080/auth/admin/liveoak-admin/console/index.html#/realms/liveoak-apps/applications/chat-html-secured/roles you should see 2 roles: "admin" and "user"
  * Role names are important, because authorization is configured to deal with those 2 roles.

* Create some default users for testing purposes (their names and default passwords are not important, feel free to use different names):
  * Go to http://localhost:8080/auth/admin/liveoak-admin/console/index.html#/realms/liveoak-apps/users
  * Add User > username: "bob" > Save
  * Then open http://localhost:8080/auth/admin/liveoak-admin/console/index.html#/realms/liveoak-apps/users/bob/user-credentials and fill some initial password for user "bob". Note that bob will need to change this default password when he try to login for the first time.
  * Then open http://localhost:8080/auth/admin/liveoak-admin/console/index.html#/realms/liveoak-apps/users/bob/role-mappings and select application "chat-html-secured" and move both available roles "admin" and "user" to the assigned roles. This means that bob will be both "admin" and "user" .
  * Repeat the steps and create another user "john", but assign him just to role "user"
  * Repeat the steps again and create last user "mary" and don't assign her to any role

* Open your browser at http://localhost:8080/chat-html-secured

Users
-----
- User 'bob' with password 'password' is admin and can do anything (subscribe, create new chat messages, view all messages received from subscription, delete any message). He is admin and so he is allowed to censor/delete any message created by any user.

- User 'mary' with password 'password' doesn't have any roles and she can't do anything (view existing messages, create new messages, subscribe to receive messages). She will receive authz error directly
 when you login because she is not authorized to subscribe.

- User 'john' with password 'password' is normal user. He can view existing messages, create new messages and subscribe to receive messages. But he is not authorized
to delete chat messages, which were not created by himself. Basically members of role 'user' can delete just their own messages.


