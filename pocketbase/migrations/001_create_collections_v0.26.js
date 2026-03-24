// PocketBase v0.26.8 兼容的迁移文件

migrate((db) => {
  // Create uploads collection
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
          collectionId: "users",
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
      },
      {
        name: "created",
        type: "autodate",
        required: true
      },
      {
        name: "updated",
        type: "autodate",
        required: true
      }
    ]
  })

  db.save(uploads)

  // Extend users collection
  const users = db.collectionById("users")
  
  users.schema.addField({
    name: "name",
    type: "text",
    required: false
  })

  users.schema.addField({
    name: "avatar",
    type: "file",
    required: false,
    options: {
      maxSelect: 1,
      maxSize: 1048576,
      mimeTypes: ["image/jpeg", "image/png"]
    }
  })

  users.schema.addField({
    name: "preferences",
    type: "json",
    required: false
  })
  
  db.save(users)

}, (db) => {
  // Rollback logic
  db.dropCollection("uploads")
  
  const users = db.collectionById("users")
  users.schema.removeField("name")
  users.schema.removeField("avatar")
  users.schema.removeField("preferences")
})
