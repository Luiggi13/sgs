import { Client } from '@elastic/elasticsearch';
import tracesConfig from 'src/config/traces-config';

export function sendElasticDocument(
  content: any,
  model_name: string,
  action = null,
) {
  const isLocal = tracesConfig().local;
  const elasticActive = tracesConfig().elastic_active;
  if (!elasticActive) return true;
  let index_doc = 'kudos_';
  if (model_name) index_doc += model_name + '_';
  if (action) index_doc += action;
  else index_doc += '_without';
  const client = new Client({
    node: isLocal ? tracesConfig().elastic_local : tracesConfig().elastic_cloud,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  client
    .index({
      index: index_doc.toLocaleLowerCase(),
      body: String(content),
    })
    .catch((err) => {
      console.log({ err });
    });
}
export function sendElasticDocumentArray(
  content: any,
  model_name: string,
  action = null,
) {
  const isLocal = tracesConfig().local;
  const elasticActive = tracesConfig().elastic_active;
  if (!elasticActive) return true;
  let index_doc = 'kudos_';
  if (model_name) index_doc += model_name + '_';
  if (action) index_doc += action;
  else index_doc += '_without';

  const client = new Client({
    node: isLocal ? tracesConfig().elastic_local : tracesConfig().elastic_cloud,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (content.length) {
    const operations = content.flatMap((doc) => [
      { index: { _index: index_doc.toLocaleLowerCase() } },
      doc,
    ]);

    client.bulk({ refresh: true, operations }).catch((err) => {
      console.log({ err });
    });
  } else {
    content.id = content._id;
    content.date = new Date();
    delete content._id;
    delete content.__v;
    client
      .index({
        index: index_doc.toLocaleLowerCase(),
        body: JSON.stringify(content),
      })
      .catch((err) => {
        console.log({ err });
      });
  }
}
export function sendElastic(category = 'error', content: any) {
  const isLocal = tracesConfig().local;
  const elasticActive = tracesConfig().elastic_active;
  if (!elasticActive) return true;
  const client = new Client({
    node: isLocal ? tracesConfig().elastic_local : tracesConfig().elastic_cloud,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (content.length) {
    const operations = content.flatMap((doc) => [
      { index: { _index: category } },
      doc,
    ]);

    client.bulk({ refresh: true, operations }).catch((err) => {
      console.log({ err });
    });
  } else {
    client
      .index({
        index: category,
        body: JSON.stringify(removeIdMongo(content)),
      })
      .catch((err) => {
        console.log({ err });
      });
  }
}

export function sendElasticBulk(category = 'error', content: any[]) {
  const isLocal = tracesConfig().local;
  const elasticActive = tracesConfig().elastic_active;
  if (!elasticActive) return true;
  const client = new Client({
    node: isLocal ? tracesConfig().elastic_local : tracesConfig().elastic_cloud,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const operations = content.flatMap((doc) => [
    { index: { _index: String(category) } },
    doc,
  ]);

  client.bulk({ refresh: true, operations }).catch((err) => {
    console.log({ err });
  });
}

function removeIdMongo(obj: object) {
  return {
    id: obj['_id'],
    name: obj['name'],
    description: obj['description'],
    icon: obj['icon'],
    date: new Date(),
  };
}
