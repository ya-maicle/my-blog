import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {muxInput} from 'sanity-plugin-mux-input'
import {media} from 'sanity-plugin-media'

export default defineConfig({
  name: 'default',
  title: 'sanity-tutorial-blog',

  projectId: 'ubv6h649',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Posts')
              .schemaType('post')
              .child(S.documentTypeList('post').title('Posts')),
            S.listItem()
              .title('Case studies')
              .schemaType('caseStudy')
              .child(S.documentTypeList('caseStudy').title('Case studies')),
            S.divider(),
            S.listItem()
              .title('Authors')
              .schemaType('author')
              .child(S.documentTypeList('author').title('Authors')),
            S.listItem()
              .title('Categories')
              .schemaType('category')
              .child(S.documentTypeList('category').title('Categories')),
          ]),
    }),
    muxInput(),
    media(),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
})
