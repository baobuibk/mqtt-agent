const debug = require("debug")("telemetry.controller");

module.exports.request = async function (req, res) {
  const { id, timestamp } = req.query;
  const entityData = req.body;

  try {
    await EntityDAO.telemetryOne({ id, data: entityData, timestamp });
    return res.sendStatus(200);
  } catch (error) {
    debug(error.message);
    return res.sendStatus(500);
  }
};

module.exports.requestGateway = async function (req, res) {
  let { gatewayId, devices, timestamp } = req.body;

  try {
    let result = await Promise.all(
      Object.entries(devices).map(async (device) => {
        const [device_id, channelData] = device;
        return await EntityDAO.telemetryOne({
          type: "Device",
          query: { gatewayId, device_id },
          data: channelData,
          timestamp: timestamp || new Date(),
        });
      })
    );
    return res.json(result);
  } catch (error) {
    debug(error.message);
    return res.sendStatus(500);
  }
};

if (id && !ObjectId.isValid(id)) throw new Error("invalid id");
//
let notifyObject = { timestamp: timestamp || new Date(), data: {} };
//
let setObject = {};
for (const [attr, attributeData] of Object.entries(data)) {
  setObject[attr + ".value"] = attributeData;
  setObject[attr + ".type"] = "Property";
  //
  notifyObject.data[attr] = attributeData;
  //
}
let queryObject = makeQueryObject(query);
let filter = {
  ...(id && { _id: ObjectId(id) }),
  ...(type && { type }),
  ...queryObject,
};
let result = await Entity.findOneAndUpdate(filter, { $set: setObject });
if (!result.ok) throw new Error("mongodb");
if (!result.value) throw new Error("id not found");
redisClient.publish(
  "context-broker/for-record-engine/" + result.value._id.toString(),
  JSON.stringify(notifyObject)
);

// static async telemetryOne({ id, type, query, data, timestamp }) {
//   if (id && !ObjectId.isValid(id)) throw new Error("invalid id");
//   //
//   let notifyObject = { timestamp: timestamp || new Date(), data: {} };
//   //
//   let setObject = {};
//   for (const [attr, attributeData] of Object.entries(data)) {
//     setObject[attr + ".value"] = attributeData;
//     setObject[attr + ".type"] = "Property";
//     //
//     notifyObject.data[attr] = attributeData;
//     //
//   }
//   let queryObject = makeQueryObject(query);
//   let filter = {
//     ...(id && { _id: ObjectId(id) }),
//     ...(type && { type }),
//     ...queryObject,
//   };
//   let result = await Entity.findOneAndUpdate(filter, { $set: setObject });
//   if (!result.ok) throw new Error("mongodb");
//   if (!result.value) throw new Error("id not found");
//   redisClient.publish(
//     "context-broker/for-record-engine/" + result.value._id.toString(),
//     JSON.stringify(notifyObject)
//   );
//   return true;
// }

// static async getRecordById(props) {
//   const { id, attrs, options } = props;
//   const entity = await Entity.findOne({ _id: ObjectId(id) });
//   if (!entity) return null;
//   return solveEntityRecord({ entity, attrs, options });
// }

// static async getRecordMany({}) {
//   return null;
// }

// async function solveEntityRecord({ entity, attrs, options }) {
//   let result = { id: entity._id, type: entity.type };

//   let attrList = attrs ? solveList(attrs) : Object.keys(entity);
//   let filteredList = attrList.filter((attr) => !sysAttrs.includes(attr));

//   for (const attr of filteredList) {
//     result[attr] = await solveRecord(entity, attr, options);
//   }
//   return result;
// }
