// PocketBase v0.36.7 兼容的迁移文件

migrate((db) => {
  // Create uploads collection
  const uploads = new Collection({
    id: "uploads",
    name: "uploads",
    type: "base"
  })

  uploads.schema.addField(new SchemaField({
    name: "user",
    type: "relation",
    required: true,
    options: {
      collectionId: "users",
      maxSelect: 1,
      displayFields: []
    }
  }))

  uploads.schema.addField(new SchemaField({
    name: "chatId",
    type: "text",
    required: true
  }))

  uploads.schema.addField(new SchemaField({
    name: "file",
    type: "file",
    required: true,
    options: {
      maxSelect: 1,
      maxSize: 5242880, // 5MB
      allowedTypes: ["image/jpeg", "image/png", "application/pdf", "text/plain"]
    }
  }))

  uploads.schema.addField(new SchemaField({
    name: "originalName",
    type: "text",
    required: true
  }))

  uploads.schema.addField(new SchemaField({
    name: "mediaType",
    type: "text",
    required: true
  }))

  uploads.schema.addField(new SchemaField({
    name: "size",
    type: "number",
    required: true
  }))

  uploads.schema.addField(new SchemaField({
    name: "created",
    type: "autodate",
    required: true
  }))

  uploads.schema.addField(new SchemaField({
    name: "updated",
    type: "autodate",
    required: true
  }))

  db.save(uploads)

  // Extend users collection
  const users = db.collectionById("users")
  
  users.schema.addField(new SchemaField({
    name: "name",
    type: "text",
    required: false
  }))

  users.schema.addField(new SchemaField({
    name: "avatar",
    type: "file",
    required: false,
    options: {
      maxSelect: 1,
      maxSize: 1048576, // 1MB
      allowedTypes: ["image/jpeg", "image/png"]
    }
  }))

  users.schema.addField(new SchemaField({
    name: "preferences",
    type: "json",
    required: false
  }))
  
  db.save(users)

}, (db) => {
  // Rollback logic
  db.dropCollection("uploads")
  
  const users = db.collectionById("users")
  users.schema.removeField("name")
  users.schema.removeField("avatar")
  users.schema.removeField("preferences")
})
