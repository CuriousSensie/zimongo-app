// cat - 1 can only sell products
// cat - 2 can sell products and services
// cat - 3 can only sell services

export const categories = {
  category1: [
    "manufacturer",
    "trader",
    "distributor",
    "wholesaler",
    "retailer",
    "exporter",
    "importer",
    "oem",
    "odm",
  ],

  category2: [
    "broker",
    "commission-agent",
    // 'franchisee-franchisor',
    "startup",
    "sourcing-agent",
    "aggregator",
  ],

  category3: ["freelancer", "service-provider", "consultant"],
};
