<!-- This is to generate migration files after you make changes to the schema of the entities -->

npm run migration:generate -- src/migration/migration -- -d src/config/data-source.ts

<!-- to run the migration generated files  -->

npx typeorm-ts-node-commonjs migration:run -- -d src/config/data-source.ts
