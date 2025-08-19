import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { onboarding } from "@/constant/onboarding";
import { toast } from "sonner";
import { locationService } from "@/utils/country-state-city";
import z from "zod";
import Api from "@/lib/api";
import useUser from "@/hooks/useUser";
import { useRouter } from "next/navigation";

const stepSchemas = [
  // Step 0
  z.object({
    companySize: z.string().nonempty("Company Size is required."),
    yearOfEstablishment: z.coerce
      .number()
      .min(1950, { message: "Year must be after 1950" })
      .max(new Date().getFullYear(), {
        message: `Year cannot be later than ${new Date().getFullYear()}`,
      }),
    businessSubcategory: z
      .string()
      .nonempty("Business Subcategory is required."),
    businessCategory: z.string().nonempty("Business Category is required."),
    legalStatus: z.string().nonempty("Legal Status is required."),
    companyName: z
      .string()
      .nonempty("Company Name is required.")
      .min(3, "Company Name must be at least 3 characters long."),
  }),

  // Step 1
  z.object({
    website: z.url("Enter a valid website URL.").optional().or(z.literal("")),
    email: z.email("Enter a valid email address."),
    mobile: z.string().min(10, "Enter a valid mobile number."),
    zip: z.string().min(4, "ZIP / Postal Code is required."),
    address1: z.string().min(10, "Address seems to invalid."),
  }),

  // Step 2
  z.object({
    companyDescription: z.string().min(1, "Company Description is required."),
    businessModel: z.string().min(1, "Business Model is required."),
  }),

  // Step 3 (socials) is optional
  z.object({
    facebook: z.url("Invalid URL for Facebook").optional().or(z.literal("")),
    insta: z.url("Invalid URL for Instagram").optional().or(z.literal("")),
    linkedin: z.url("Invalid URL for Linkedin").optional().or(z.literal("")),
    twitter: z.url("Invalid URL for Twitter").optional().or(z.literal("")),
    youtube: z.url("Invalid URL for YouTube").optional().or(z.literal("")),
    tiktok: z.url("Invalid URL for TikTok").optional().or(z.literal("")),
  }),
];

const OnboardingSteps = ({
  steps,
  role,
  setRole,
}: {
  steps: { title: string; desc: string }[];
  role: string;
  setRole: (role: string) => void;
}) => {
  const user = useUser();
  const router = useRouter();
  const host = window.location.host;

  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    role: role,
    companyName: "",
    legalStatus: "",
    businessCategory: "",
    businessSubcategory: "",
    yearOfEstablishment: "",
    companySize: "",
    address1: "",
    address2: "",
    country: "",
    state: "",
    city: "",
    zip: "",
    mobile: "",
    landline: "",
    email: "",
    website: "",
    companyDescription: "",
    logoFile: null as File | null,
    businessModel: "",
    certifications: "",
    facebook: "",
    instagram: "",
    linkedin: "",
    twitter: "",
    youtube: "",
    tiktok: "",
    otherSocials: "",
  });
  useEffect(() => {
    if (user.me?._id) formData.userId = user.me._id;
  }, [user?.me]);

  // location handling
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [userCountry, setUserCountry] = useState("");

  useEffect(() => {
    // TODO: get user's current location, set and lock country and state.
    const getuserLocation = async () => {
      try {
        const countryData = await locationService.getCountries();
        console.log(countryData);
        setCountries(countryData);
      } catch (error) {
        console.error("Error fetching countries: ", (error as Error).message);
      }
    };

    getuserLocation();
  }, []);

  const handleCountryChange = async (countryCode: string) => {
    handleChange("country", countryCode);
    handleChange("state", "");
    handleChange("city", "");
    setStates([]);
    setCities([]);

    try {
      const statesData = await locationService.getStates(countryCode);
      setStates(statesData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStateChange = async (stateCode: string) => {
    handleChange("state", stateCode);
    handleChange("city", "");
    setCities([]);

    try {
      const citiesData = await locationService.getCities(
        formData.country,
        stateCode
      );
      setCities(citiesData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    if (e.target.files && e.target.files[0]) {
      handleChange(field, e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    console.log("Form submitted:", formData);

    try {
      const form = new FormData();

      const { logoFile, ...rest} = formData; // append without logoFile
      form.append("data", JSON.stringify(rest));

      if (logoFile instanceof File) {
        form.append("logoFile", logoFile);
      }

      const response = await Api.createProfile(form);

      if (response.status === 200) {
        toast.success("Profile created successfully", {
          position: "top-center",
          richColors: true,
          action: {
            label: "Close",
            onClick: () => window.location.reload(),
          },
        });
        router.replace(`${response.data.slug}.${host}/dashboard`);
      } else {
        toast.error(`${response.data.msg}`, {
          position: "top-center",
          richColors: true,
          action: {
            label: "Close",
            onClick: () => null,
          },
        });
      }
    } catch (error) {
      toast.error(`Something unexpected happened. Try Again later.`, {
        position: "top-center",
        richColors: true,
        action: {
          label: "Close",
          onClick: () => null,
        },
      });
    } finally {
      setSubmitting(false);
    }
  };

  const goNext = () => {
    const currentSchema = stepSchemas[currentStep];
    const result = currentSchema.safeParse(formData);

    if (result.success) {
      setCurrentStep((prev) => prev + 1);
    } else {
      result.error.issues.forEach((err) => {
        toast.warning("Field Required", {
          description: err.message,
          position: "top-center",
          richColors: true,
          action: {
            label: "Close",
            onClick: () => null,
          },
        });
      });
    }
  };

  const goPrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const selectedCategory = onboarding.businessCategories.find(
    (cat) => cat.value === formData.businessCategory
  );

  return (
    <div className="flex flex-col justify-between h-full p-4">
      {/* Stepper Header */}
      <div className="flex items-center lg:w-2/3 gap-4 mb-4 mx-auto w-full justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col w-full items-center gap-2">
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${
                index === currentStep
                  ? "bg-blue-100 text-white border-blue-300"
                  : index < currentStep
                    ? "bg-slate-500 text-white border-slate-500"
                    : "border-gray-300 text-gray-500"
              }`}
            >
              {index + 1}
            </div>
            <span className="text-sm">{step.title}</span>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="h-[60vh] overflow-y-auto flex flex-col gap-3 p-3 border rounded-lg bg-white ">
        {currentStep === 0 && (
          <>
            <Label>
              Company Name <span className="text-red-400">*</span>
            </Label>
            <Input
              value={formData.companyName}
              onChange={(e) => handleChange("companyName", e.target.value)}
            />

            <Label>
              Legal Status <span className="text-red-400">*</span>
            </Label>
            <Select
              value={formData.legalStatus}
              onValueChange={(status) => handleChange("legalStatus", status)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Legal Status" />
              </SelectTrigger>
              <SelectContent>
                {onboarding.legalStatuses.map((status) => (
                  <SelectItem value={status.value} key={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Label>
              Business Category <span className="text-red-400">*</span>
            </Label>
            <Select
              onValueChange={(cat) => {
                handleChange("businessCategory", cat);
                handleChange("businessSubcategory", "");
              }}
              value={formData.businessCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Category/Industry" />
              </SelectTrigger>
              <SelectContent>
                {onboarding.businessCategories.map((cat) => (
                  <SelectItem value={cat.value} key={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Label>
              Business Subcategory <span className="text-red-400">*</span>
            </Label>
            <Select
              disabled={formData.businessCategory === ""}
              onValueChange={(subcat) =>
                handleChange("businessSubcategory", subcat)
              }
              value={formData.businessSubcategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sub-Category / Sub-Industry" />
              </SelectTrigger>
              <SelectContent>
                {selectedCategory?.subcategories.map((subCat) => (
                  <SelectItem value={subCat.value} key={subCat.value}>
                    {subCat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Label>
              Year of Establishment <span className="text-red-400">*</span>
            </Label>
            <Input
              type="number"
              placeholder="e.g., 2010"
              value={formData.yearOfEstablishment}
              onChange={(e) =>
                handleChange("yearOfEstablishment", e.target.value)
              }
              min={1950}
              max={new Date().getFullYear()}
            />

            <Label>
              Company Size <span className="text-red-400">*</span>
            </Label>
            <Select
              value={formData.companySize}
              onValueChange={(size) => handleChange("companySize", size)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Size" />
              </SelectTrigger>
              <SelectContent>
                {onboarding.companySizes.map((size) => (
                  <SelectItem key={size.value} value={size.value}>
                    {size.Label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        )}

        {currentStep === 1 && (
          <>
            <Label>
              Address Line 1 <span className="text-red-400">*</span>
            </Label>
            <Input
              value={formData.address1}
              onChange={(e) => handleChange("address1", e.target.value)}
            />

            <Label>Address Line 2 (Optional)</Label>
            <Input
              value={formData.address2}
              onChange={(e) => handleChange("address2", e.target.value)}
            />

            <Label>
              Country <span className="text-red-400">*</span>
            </Label>
            <Select
              value={formData.country}
              onValueChange={(value) => handleCountryChange(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((c: { iso2: string; name: string }) => (
                  <SelectItem key={c.iso2} value={c.iso2}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Label>
              State / Province <span className="text-red-400">*</span>
            </Label>
            <Select
              value={formData.state}
              onValueChange={(value) => handleStateChange(value)}
              disabled={!formData.country}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent>
                {states.map((s: { iso2: string; name: string }) => (
                  <SelectItem key={s.iso2} value={s.iso2}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Label>
              City <span className="text-red-400">*</span>
            </Label>
            <Select
              value={formData.city}
              onValueChange={(value) => handleChange("city", value)}
              disabled={!formData.state}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select City" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city: { name: string }) => (
                  <SelectItem key={city.name} value={city.name}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Label>
              ZIP / Postal Code <span className="text-red-400">*</span>
            </Label>
            <Input
              value={formData.zip}
              onChange={(e) => handleChange("zip", e.target.value)}
            />

            <Label>
              Mobile Number <span className="text-red-400">*</span>
            </Label>
            <Input
              value={formData.mobile}
              onChange={(e) => handleChange("mobile", e.target.value)}
            />

            <Label>Landline Number (Optional)</Label>
            <Input
              value={formData.landline}
              onChange={(e) => handleChange("landline", e.target.value)}
            />

            <Label>
              Email Address <span className="text-red-400">*</span>
            </Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />

            <Label>Website / URL</Label>
            <Input
              value={formData.website}
              onChange={(e) => handleChange("website", e.target.value)}
            />
          </>
        )}

        {currentStep === 2 && (
          <>
            <Label>
              Company Description <span className="text-red-400">*</span>
            </Label>
            <Textarea
              value={formData.companyDescription}
              onChange={(e) =>
                handleChange("companyDescription", e.target.value)
              }
            />

            <Label>Company Logo / Personal Photo</Label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, "logoFile")}
            />

            <Label>
              Business Model <span className="text-red-400">*</span>
            </Label>
            <Select
              value={formData.businessModel}
              onValueChange={(model) => handleChange("businessModel", model)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Model" />
              </SelectTrigger>
              <SelectContent>
                {onboarding.businessModels.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    {model.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* <Label>Certifications / Awards</Label>
            <Textarea
              value={formData.certifications}
              onChange={(e) => handleChange("certifications", e.target.value)}
            /> */}
          </>
        )}

        {currentStep === 3 && (
          <>
            <Label>Facebook Profile / Page</Label>
            <Input
              value={formData.facebook}
              onChange={(e) => handleChange("facebook", e.target.value)}
            />

            <Label>Instagram Profile</Label>
            <Input
              value={formData.instagram}
              onChange={(e) => handleChange("instagram", e.target.value)}
            />

            <Label>LinkedIn Profile</Label>
            <Input
              value={formData.linkedin}
              onChange={(e) => handleChange("linkedin", e.target.value)}
            />

            <Label>Twitter / X Handle</Label>
            <Input
              value={formData.twitter}
              onChange={(e) => handleChange("twitter", e.target.value)}
            />

            <Label>YouTube Channel</Label>
            <Input
              value={formData.youtube}
              onChange={(e) => handleChange("youtube", e.target.value)}
            />

            <Label>TikTok Profile</Label>
            <Input
              value={formData.tiktok}
              onChange={(e) => handleChange("tiktok", e.target.value)}
            />
          </>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-4">
        <Button onClick={() => setRole("")} hidden={currentStep !== 0}>
          Change Role
        </Button>
        <Button onClick={goPrev} hidden={currentStep === 0}>
          Prev
        </Button>
        {currentStep < steps.length - 1 ? (
          <Button onClick={goNext}>Next</Button>
        ) : (
          <Button disabled={submitting} onClick={handleSubmit}>
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default OnboardingSteps;
