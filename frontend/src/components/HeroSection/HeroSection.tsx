import { Button, Input, Portal } from "@chakra-ui/react";
import { Select } from "@chakra-ui/react";
import { Search } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center text-white overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 opacity-90" />

      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black/20" />

      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Find The Best Leads Near You!
        </h1>

        <p className="text-xl mb-8 opacity-90">
          Connect with quality leads for products and services
        </p>

        {/* Search Form */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select.Root size="md">
              <Select.Control className="bg-white rounded-md ">
                <Select.Trigger>
                  <Select.ValueText
                    placeholder="Select Lead Type"
                    className="text-center text-zinc-700 px-2"
                  />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Portal>
                <Select.Positioner>
                  <Select.Content>
                    {[
                      { label: "Products", value: "products" },
                      { label: "Services", value: "service" },
                    ].map((type) => (
                      <Select.Item
                        item={type}
                        key={type.value}
                        className="text-zinc-700"
                      >
                        {type.label}
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>

            <Select.Root size="md">
              <Select.HiddenSelect />
              <Select.Control className="bg-white rounded-md ">
                <Select.Trigger>
                  <Select.ValueText
                    placeholder="Buy / Sell"
                    className="text-center text-zinc-700 px-2"
                  />
                </Select.Trigger>
                <Select.IndicatorGroup>
                  <Select.Indicator />
                </Select.IndicatorGroup>
              </Select.Control>
              <Portal>
                <Select.Positioner>
                  <Select.Content>
                    {[
                      { label: "I want to Buy", value: "buy" },
                      { label: "I want to Sell", value: "sell" },
                    ].map((type) => (
                      <Select.Item
                        item={type}
                        key={type.value}
                        className="text-zinc-700"
                      >
                        {type.label}
                        <Select.ItemIndicator />
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Positioner>
              </Portal>
            </Select.Root>

            <Input
              placeholder="Location"
              className="bg-white text-zinc-700 p-2"
            />
          </div>
        </div>

        <Button className="bg-amber-500 hover:bg-amber-700 text-white p-2 md:w-1/3 mt-4 gap-3">
          <Search />
          Search
        </Button>
      </div>
    </section>
  );
};

export default HeroSection;
