migrate((db) => {
  const uploads = new Collection({
    id: "uploads",
    name: "uploads",
    type: "base",
    schema: [
      {
        name: "user",
        type: "relation",
        required: true,
        options: {
          collectionId: "_pb_users_auth_",
          maxSelect: 1
        }
      },
      {
        name: "chatId",
        type: "text",
        required: true
      },
      {
        name: "file",
        type: "file",
        required: true,
        options: {
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ["image/jpeg", "image/png", "application/pdf", "text/plain"]
        }
      },
      {
        name: "originalName",
        type: "text",
        required: true
      },
      {
        name: "mediaType",
        type: "text",
        required: true
      },
      {
        name: "size",
        type: "number",
        required: true
      }
    ]
  })

  db.save(uploads)

  const users = db.collectionById("_pb_users_auth_")

  users.schema.addField({
    name: "name",
    type: "text"
  })

  users.schema.addField({
    name: "avatar",
    type: "file",
    options: {
      maxSelect: 1,
      maxSize: 1048576,
      mimeTypes: ["image/jpeg", "image/png"]
    }
  })

  users.schema.addField({
    name: "preferences",
    type: "json"
  })

  db.save(users)

}, (db) => {
  db.dropCollection("uploads")

  const users = db.collectionById("_pb_users_auth_")

  users.schema.removeField("name")
  users.schema.removeField("avatar")
  users.schema.removeField("preferences")

  db.save(users)
})