// PocketBase migration script for creating collections
// Compatible with PocketBase v0.36.x

migrate(
  db => {
    const uploads = new Collection({
      id: 'uploads',
      name: 'uploads',
      type: 'base',
      system: false,
      schema: [
        new SchemaField({
          name: 'user',
          type: 'relation',
          required: true,
          options: {
            collectionId: '_pb_users_auth_',
            maxSelect: 1,
            cascadeDelete: false,
            displayFields: []
          }
        }),
        new SchemaField({
          name: 'chatId',
          type: 'text',
          required: true,
          options: {}
        }),
        new SchemaField({
          name: 'file',
          type: 'file',
          required: true,
          options: {
            maxSelect: 1,
            maxSize: 5242880,
            mimeTypes: [
              'image/jpeg',
              'image/png',
              'application/pdf',
              'text/plain'
            ],
            thumbs: [],
            previewable: false
          }
        }),
        new SchemaField({
          name: 'originalName',
          type: 'text',
          required: true,
          options: {}
        }),
        new SchemaField({
          name: 'mediaType',
          type: 'text',
          required: true,
          options: {}
        }),
        new SchemaField({
          name: 'size',
          type: 'number',
          required: true,
          options: {}
        })
      ],
      indexes: [],
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: ''
    })

    db.createCollection(uploads)

    const users = db.collectionById('_pb_users_auth_')
    users.schema.addField(
      new SchemaField({
        name: 'name',
        type: 'text',
        required: false,
        options: {}
      })
    )

    users.schema.addField(
      new SchemaField({
        name: 'avatar',
        type: 'file',
        required: false,
        options: {
          maxSelect: 1,
          maxSize: 1048576,
          mimeTypes: ['image/jpeg', 'image/png'],
          thumbs: [],
          previewable: false
        }
      })
    )

    users.schema.addField(
      new SchemaField({
        name: 'preferences',
        type: 'json',
        required: false,
        options: {}
      })
    )
  },
  db => {
    db.dropCollection('uploads')

    const users = db.collectionById('_pb_users_auth_')
    users.schema.removeField('name')
    users.schema.removeField('avatar')
    users.schema.removeField('preferences')
  }
)
