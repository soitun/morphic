// PocketBase migration script for creating collections
// Compatible with PocketBase v0.36.x

migrate(
  app => {
    const collection = {
      name: 'uploads',
      type: 'base',
      system: false,
      schema: [
        {
          name: 'user',
          type: 'relation',
          required: true,
          options: {
            collectionId: '_pb_users_auth_',
            maxSelect: 1,
            cascadeDelete: false,
            displayFields: []
          }
        },
        {
          name: 'chatId',
          type: 'text',
          required: true,
          options: {}
        },
        {
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
        },
        {
          name: 'originalName',
          type: 'text',
          required: true,
          options: {}
        },
        {
          name: 'mediaType',
          type: 'text',
          required: true,
          options: {}
        },
        {
          name: 'size',
          type: 'number',
          required: true,
          options: {}
        }
      ],
      indexes: [],
      listRule: '',
      viewRule: '',
      createRule: '',
      updateRule: '',
      deleteRule: ''
    }

    app.save(collection)

    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.schema.addField({
      name: 'name',
      type: 'text',
      required: false,
      options: {}
    })

    users.schema.addField({
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

    users.schema.addField({
      name: 'preferences',
      type: 'json',
      required: false,
      options: {}
    })

    app.save(users)
  },
  app => {
    const uploads = app.findCollectionByNameOrId('uploads')
    if (uploads) {
      app.delete(uploads)
    }

    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    users.schema.removeField('name')
    users.schema.removeField('avatar')
    users.schema.removeField('preferences')
    app.save(users)
  }
)
