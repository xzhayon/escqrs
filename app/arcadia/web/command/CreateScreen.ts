import { Effect, pipe } from '@effect-ts/core'
import { FastifyPluginAsync } from 'fastify'
import { $Aggregate } from '../../../../src/Aggregate'
import { $Repository } from '../../../../src/Repository'
import { $Screen, Screen } from '../../Screen'

export const $CreateScreen: FastifyPluginAsync = async (instance, opts) => {
  instance.post(
    '/api/v1/screens',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                _: {
                  properties: {
                    type: { type: 'string' },
                    id: { type: 'string' },
                    date: {
                      type: 'object',
                      properties: {
                        created: { type: 'string', format: 'date-time' },
                        updated: { type: 'string', format: 'date-time' },
                      },
                      required: ['created', 'updated'],
                    },
                    version: { type: 'number' },
                  },
                  required: ['type', 'id', 'date', 'version'],
                },
                name: { type: 'string' },
                seats: {
                  type: 'object',
                  properties: {
                    rows: { type: 'number' },
                    columns: { type: 'number' },
                  },
                  required: ['rows', 'columns'],
                },
              },
              required: ['_', 'name', 'seats'],
            },
          },
          required: ['data'],
        },
      },
    },
    async (request, _reply) =>
      pipe(
        $Screen.save((request.body as any).data),
        Effect.map(() => request.body),
      ),
  )
}
