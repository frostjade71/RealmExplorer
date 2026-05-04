import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  useSubmitServerMutation,
  useUpdateServerMutation,
} from "../hooks/mutations";
import { useServer, useUserServers } from "../hooks/queries";
import { supabase } from "../lib/supabase";
import type { ServerCategory, SocialLink } from "../types";
import {
  Server,
  Globe,
  Plus,
  Trash2,
  Layers,
  Tags,
  Type,
  Link,
  Share2,
  FileText,
  MoreHorizontal,
  User,
  GripVertical,
  Info,
} from "lucide-react";
import {
  SiDiscord,
  SiInstagram,
  SiYoutube,
  SiTiktok,
  SiFacebook,
  SiTwitch,
} from "react-icons/si";
import { AnimatedPage } from "../components/AnimatedPage";
import { FramerIn } from "../components/FramerIn";
import { motion, Reorder } from "framer-motion";
import { ImageUpload } from "../components/ImageUpload";
import { slugify } from "../lib/urlUtils";
import { toast } from "sonner";
import { CustomSelect } from "../components/CustomSelect";

// Category Icons
import factionsIcon from "../assets/category/7587-netherite-sword.png";
import kitpvpIcon from "../assets/category/95615-mace.png";
import skyblockIcon from "../assets/category/41601-minecraftoaktree.png";
import moddedIcon from "../assets/category/437888-bedrock.png";
import smpIcon from "../assets/category/708066-iron-pickaxe (1).png";
import skygenIcon from "../assets/category/89458-iron-block.png";
import prisonIcon from "../assets/category/7504_Iron_Bars.png";

interface ReorderableSocialLink extends SocialLink {
  localId: string;
}

export function SubmitPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get("role") || "Owner";

  const isEditing = !!id;
  const { user, hasPremiumPerks } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const limits = {
    gallery: hasPremiumPerks ? 5 : 1,
    description: hasPremiumPerks ? 5000 : 2000,
    socialLinks: hasPremiumPerks ? 6 : 2,
    listings: hasPremiumPerks ? 5 : 1
  };
  const [originalImageUrls, setOriginalImageUrls] = useState({
    icon: "",
    banner: "",
    gallery: [] as string[],
  });
  const { data: serverData } = useServer(id);

  const [formData, setFormData] = useState({
    type: "server" as "server" | "realm",
    name: "",
    description: "",
    category: "smp" as ServerCategory,
    ip_or_code: "",
    port: "" as string | number,
    bedrock_ip: "",
    website_url: "",
    icon_url: "",
    banner_url: "",
    gallery: [] as string[],
    social_links: [] as ReorderableSocialLink[],
    submitter_role: roleParam,
    verify_discord: false,
  });

  const [showBedrockIp, setShowBedrockIp] = useState(false);

  useEffect(() => {
    if (serverData?.server) {
      const { server } = serverData;
      const initialData = {
        type: server.type as "server" | "realm",
        name: server.name,
        description: server.description || "",
        category: server.category as ServerCategory,
        ip_or_code: server.ip_or_code || "",
        port: server.port || "",
        bedrock_ip: server.bedrock_ip || "",
        website_url: server.website_url || "",
        icon_url: server.icon_url || "",
        banner_url: server.banner_url || "",
        gallery:
          Array.isArray(server.gallery) && server.gallery.length > 0
            ? [...server.gallery]
            : [],
        social_links: (server.social_links || []).map((link: any) => ({
          ...link,
          localId: Math.random().toString(36).substr(2, 9),
        })),
        submitter_role: server.submitter_role || "Owner",
        verify_discord: !!server.verify_discord,
      };
      setFormData(initialData);
      setShowBedrockIp(!!server.bedrock_ip);
      setOriginalImageUrls({
        icon: server.icon_url || "",
        banner: server.banner_url || "",
        gallery: server.gallery || [],
      });
    }
  }, [serverData]);

  const { data: userServers = [] } = useUserServers(user?.id);

  useEffect(() => {
    if (!isEditing && userServers.length >= limits.listings) {
      toast.error("Listing Limit Reached", {
        description: `Your current tier allows up to ${limits.listings} listing${limits.listings > 1 ? 's' : ''}.`
      });
      navigate("/dashboard");
    }
  }, [isEditing, userServers, limits.listings, navigate]);

  const submitMutation = useSubmitServerMutation();
  const updateMutation = useUpdateServerMutation();

  const cleanupOldImages = async (newIcon: string, newBanner: string) => {
    const filesToDelete: string[] = [];

    // Extract path from Supabase URL: .../public/server-assets/[path]
    const getPath = (url: string) => {
      if (!url || !url.includes("server-assets/")) return null;
      return url.split("server-assets/").pop();
    };

    if (originalImageUrls.icon && originalImageUrls.icon !== newIcon) {
      const path = getPath(originalImageUrls.icon);
      if (path) filesToDelete.push(path);
    }

    if (originalImageUrls.banner && originalImageUrls.banner !== newBanner) {
      const path = getPath(originalImageUrls.banner);
      if (path) filesToDelete.push(path);
    }

    // Cleanup deleted or changed gallery images
    const currentGallery = formData.gallery.filter(Boolean);
    originalImageUrls.gallery.forEach((oldUrl) => {
      if (!currentGallery.includes(oldUrl)) {
        const path = getPath(oldUrl);
        if (path) filesToDelete.push(path);
      }
    });

    if (filesToDelete.length > 0) {
      try {
        await supabase.storage.from("server-assets").remove(filesToDelete);
        console.log("Cleaned up old images:", filesToDelete);
      } catch (err) {
        console.error("Failed to cleanup old images:", err);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError("");

    if (!formData.icon_url) {
      setError("Please upload a server icon.");
      return;
    }

    if (formData.verify_discord && !formData.website_url) {
      toast.error("Discord Link Required", {
        description: "Please add a Discord Invite Link to use the 'Verify on Discord First' feature."
      });
      setError("Please add a Discord Invite Link.");
      const discordInput = document.querySelector('input[type="url"]');
      if (discordInput) {
        (discordInput as HTMLElement).focus();
        discordInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const slug = slugify(formData.name);

    const checkAndSubmit = async () => {
      // Check if slug is unique
      let query = supabase.from("servers").select("id").eq("slug", slug);

      if (id) {
        query = query.neq("id", id);
      }

      const { data: existing, error: checkError } = await query.maybeSingle();

      if (checkError) {
        setError("Error checking name availability. Please try again.");
        return;
      }

      if (existing) {
        setError(
          "A server with this name already exists. Please choose a unique name.",
        );
        return;
      }

      if (isEditing) {
        const currentStatus = serverData?.server?.status || "approved";
        const iconChanged = formData.icon_url !== originalImageUrls.icon;
        const bannerChanged = formData.banner_url !== originalImageUrls.banner;
        const currentGallery = formData.gallery.filter(Boolean);
        const galleryChanged =
          currentGallery.length > 0 &&
          JSON.stringify(currentGallery) !==
            JSON.stringify(originalImageUrls.gallery);

        let newStatus: import("../types").ServerStatus = currentStatus;

        if (iconChanged || bannerChanged || galleryChanged) {
          if (iconChanged && bannerChanged && galleryChanged)
            newStatus = "Review All Assets";
          else if (iconChanged && bannerChanged)
            newStatus = "Review Icon & Cover";
          else if (iconChanged && galleryChanged)
            newStatus = "Review Icon & Gallery";
          else if (bannerChanged && galleryChanged)
            newStatus = "Review Cover & Gallery";
          else if (iconChanged) newStatus = "Review Icon";
          else if (bannerChanged) newStatus = "Review Cover";
          else if (galleryChanged) newStatus = "Review Gallery";
        } else if (
          currentStatus === "rejected" ||
          currentStatus === "emailed"
        ) {
          newStatus = "pending";
        }

        const status: import("../types").ServerStatus = newStatus;

        const submissionData = {
          ...formData,
          port: formData.port === "" ? null : Number(formData.port),
          bedrock_ip: formData.bedrock_ip || null,
          slug,
          status,
          submitter_role: formData.submitter_role,
          gallery: formData.gallery.filter(Boolean),
          social_links: formData.social_links.map(
            ({ localId, ...link }: any) => link,
          ),
          verify_discord: formData.verify_discord,
        };

        updateMutation.mutate(
          {
            id,
            ...submissionData,
          },
          {
            onSuccess: () => {
              cleanupOldImages(formData.icon_url, formData.banner_url);
              toast.success("Listing Updated", {
                description:
                  iconChanged || bannerChanged
                    ? "Your changes are saved. Visual assets are pending review."
                    : "Your server details have been updated successfully.",
              });
              navigate("/dashboard");
            },
            onError: (err: any) => {
              setError(err.message);
              toast.error("Failed to update listing", {
                description: err.message,
              });
            },
          },
        );
      } else {
        const submissionData = {
          ...formData,
          port: formData.port === "" ? null : Number(formData.port),
          bedrock_ip: formData.bedrock_ip || null,
          slug,
          owner_id: user.id,
          status: "pending",
          gallery: formData.gallery.filter(Boolean),
          social_links: formData.social_links.map(
            ({ localId, ...link }: any) => link,
          ),
          verify_discord: formData.verify_discord,
        };

        submitMutation.mutate(submissionData, {
          onSuccess: () => {
            toast.success("Registration Submitted", {
              description: "Your server is now pending review by our staff.",
            });
            navigate("/dashboard");
          },
          onError: (err: any) => {
            setError(err.message);
            toast.error("Submission failed", { description: err.message });
          },
        });
      }
    };

    checkAndSubmit();
  };

  const categories: ServerCategory[] = [
    "factions",
    "kitpvp",
    "skyblock",
    "skygen",
    "prison",
    "smp",
    "modded",
    "other",
  ];

  const categoryOptions = categories.map((c) => ({
    key: c,
    label: c.charAt(0).toUpperCase() + c.slice(1),
    icon: (() => {
      const icons: Record<string, string> = {
        smp: smpIcon,
        factions: factionsIcon,
        kitpvp: kitpvpIcon,
        skyblock: skyblockIcon,
        skygen: skygenIcon,
        prison: prisonIcon,
        modded: moddedIcon,
      };
      return icons[c] ? (
        <img src={icons[c]} alt="" className="w-5 h-5 object-contain" />
      ) : (
        <MoreHorizontal className="w-5 h-5 text-zinc-500" />
      );
    })(),
  }));

  const socialOptions = [
    {
      key: "website",
      label: "Website",
      icon: <Globe className="w-3.5 h-3.5" />,
    },
    {
      key: "instagram",
      label: "Instagram",
      icon: <SiInstagram className="w-3.5 h-3.5" />,
    },
    {
      key: "youtube",
      label: "YouTube",
      icon: <SiYoutube className="w-3.5 h-3.5" />,
    },
    {
      key: "tiktok",
      label: "TikTok",
      icon: <SiTiktok className="w-3.5 h-3.5" />,
    },
    {
      key: "facebook",
      label: "Facebook",
      icon: <SiFacebook className="w-3.5 h-3.5" />,
    },
    {
      key: "twitch",
      label: "Twitch",
      icon: <SiTwitch className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <AnimatedPage className="max-w-5xl mx-auto px-8 py-12">
      <div className="mb-10 text-center">
        <FramerIn>
          <h1 className="text-3xl font-pixel text-white mb-4">
            {isEditing ? "Edit Listing" : "Submit Listing"}
          </h1>
          <p className="text-zinc-400 font-headline">
            {isEditing
              ? "Modify your server or realm details below."
              : "Register your Server or Realm to our global index."}
          </p>
        </FramerIn>
      </div>

      <FramerIn delay={0.2}>
        <div className="mb-6 flex justify-center">
          <div className="inline-flex items-center gap-3 bg-zinc-900 border border-zinc-800 px-6 py-3 rounded-xl shadow-xl">
            <div className="w-10 h-10 bg-realm-green/10 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-realm-green" />
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 font-headline uppercase tracking-widest leading-none mb-1">
                Listing As
              </p>
              <p
                className={`font-pixel text-sm uppercase leading-none ${
                  formData.submitter_role === "Owner"
                    ? "text-yellow-400"
                    : "text-realm-green"
                }`}
              >
                {formData.submitter_role}
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl space-y-6 shadow-2xl"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg font-headline text-sm"
            >
              {error}
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-zinc-800">
            <ImageUpload
              label="Server Icon"
              onUpload={(url) => setFormData({ ...formData, icon_url: url })}
              value={formData.icon_url}
              aspectRatio="square"
            />
            <ImageUpload
              label="Cover Banner"
              onUpload={(url) => setFormData({ ...formData, banner_url: url })}
              value={formData.banner_url}
              aspectRatio="video"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 col-span-2 md:col-span-1">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-headline flex items-center gap-2">
                <Layers className="w-3 h-3" /> Type
              </label>
              <div className="flex flex-col md:flex-row gap-3 md:gap-4 relative z-10">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "server" })}
                  className={`flex-1 py-3 px-4 rounded-lg border flex items-center justify-center gap-2 font-headline font-bold transition-all active:scale-95 whitespace-nowrap ${formData.type === "server" ? "bg-realm-green/10 border-realm-green text-realm-green" : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300"}`}
                >
                  <Server className="w-4 h-4" /> Server (Java)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: "realm" })}
                  className={`flex-1 py-3 px-4 rounded-lg border flex items-center justify-center gap-2 font-headline font-bold transition-all active:scale-95 whitespace-nowrap ${formData.type === "realm" ? "bg-realm-green/10 border-realm-green text-realm-green" : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300"}`}
                >
                  <Globe className="w-4 h-4" /> Bedrock (Realm)
                </button>
              </div>
            </div>

            <div className="space-y-2 col-span-2 md:col-span-1">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-headline flex items-center gap-2">
                <Tags className="w-3 h-3" /> Category
              </label>
              <CustomSelect
                value={formData.category}
                onChange={(val) => setFormData({ ...formData, category: val })}
                options={categoryOptions}
                placeholder="Select Category"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-headline flex items-center gap-2">
                <Type className="w-3 h-3" /> Name
              </label>
              <input
                required
                type="text"
                maxLength={100}
                placeholder="e.g. Hypixel Network"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white outline-none focus:border-realm-green transition-all font-headline focus:ring-1 focus:ring-realm-green/30"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div
              className={`space-y-2 col-span-2 ${formData.type === "server" ? "md:col-span-2" : "md:col-span-1"}`}
            >
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-headline flex items-center gap-2">
                  <Link className="w-3 h-3" />{" "}
                  {formData.type === "server" ? "Java IP" : "Realm Code"}
                </label>
                {formData.type === "realm" && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-headline">Verify on Discord First</span>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, verify_discord: !formData.verify_discord })}
                        className={`w-8 h-4 rounded-full transition-colors relative ${formData.verify_discord ? 'bg-realm-green' : 'bg-zinc-800'}`}
                      >
                        <motion.div
                          animate={{ x: formData.verify_discord ? 16 : 2 }}
                          className="w-3 h-3 bg-white rounded-full absolute top-0.5"
                        />
                      </button>
                    </div>
                    <div className="group relative">
                      <Info className="w-3 h-3 text-zinc-500 cursor-help hover:text-zinc-300 transition-colors" />
                      <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-zinc-800 text-[10px] text-zinc-300 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-zinc-700 font-headline leading-tight">
                        Enabling this will allow users to verify first in your discord server to be able to join in your server
                      </div>
                    </div>
                  </div>
                )}
                {formData.type === "server" && !showBedrockIp && (
                  <button
                    type="button"
                    onClick={() => setShowBedrockIp(true)}
                    className="text-[10px] font-bold uppercase tracking-wider text-realm-green hover:text-[#85fc7e] transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Bedrock IP
                  </button>
                )}
              </div>

              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-grow">
                  <input
                    required
                    type="text"
                    placeholder={
                      formData.type === "server"
                        ? "play.example.com"
                        : "https://realms.gg/your-code"
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white outline-none focus:border-realm-green transition-all font-headline focus:ring-1 focus:ring-realm-green/30"
                    value={formData.ip_or_code}
                    onChange={(e) =>
                      setFormData({ ...formData, ip_or_code: e.target.value })
                    }
                  />
                </div>
                {formData.type === "server" && (
                  <div className="w-full md:w-32">
                    <input
                      type="number"
                      placeholder="19132"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white outline-none focus:border-realm-green transition-all font-headline focus:ring-1 focus:ring-realm-green/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      value={formData.port}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          port: e.target.value ? parseInt(e.target.value) : "",
                        })
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSubmit(e as any);
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {formData.type === "server" && showBedrockIp && (
              <div className="space-y-2 col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-headline flex items-center gap-2">
                    <Link className="w-3 h-3" /> Bedrock IP
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowBedrockIp(false);
                      setFormData({ ...formData, bedrock_ip: "" });
                    }}
                    className="text-[10px] font-bold uppercase tracking-wider text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="play.example.com"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white outline-none focus:border-realm-green transition-all font-headline focus:ring-1 focus:ring-realm-green/30"
                  value={formData.bedrock_ip}
                  onChange={(e) =>
                    setFormData({ ...formData, bedrock_ip: e.target.value })
                  }
                />
              </div>
            )}

            <div className="space-y-2 col-span-2 md:col-span-1">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-headline flex items-center gap-2">
                <SiDiscord className="w-3 h-3" /> Discord Invite Link
              </label>
              <div className="relative">
                <SiDiscord className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="url"
                  placeholder="https://discord.gg/yourserver"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-12 pr-4 py-3 text-white outline-none focus:border-realm-green transition-all font-headline focus:ring-1 focus:ring-realm-green/30"
                  value={formData.website_url}
                  required={formData.verify_discord}
                  onChange={(e) =>
                    setFormData({ ...formData, website_url: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Social Links Manager */}
            <div className="space-y-4 col-span-2 pt-4 border-t border-zinc-800/50">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-headline flex items-center gap-2">
                  <Share2 className="w-3 h-3" /> Social Links
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if ((formData.social_links?.length || 0) >= limits.socialLinks) {
                      if (!hasPremiumPerks) {
                        toast.info('Explorer+ Feature', {
                          description: 'Upgrade to Explorer+ to add up to 6 social links!'
                        })
                      } else {
                        toast.warning('Limit Reached', {
                          description: `Maximum of ${limits.socialLinks} social links reached.`
                        })
                      }
                      return
                    }
                    const newSocialLinks = [
                      ...(formData.social_links || []),
                      {
                        platform: "website",
                        url: "",
                        localId: Math.random().toString(36).substr(2, 9),
                      } as ReorderableSocialLink,
                    ];
                    setFormData({ ...formData, social_links: newSocialLinks });
                  }}
                  className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${(formData.social_links?.length || 0) >= limits.socialLinks ? "text-zinc-500 hover:text-zinc-400" : "text-realm-green hover:text-[#85fc7e]"}`}
                >
                  <Plus className="w-3 h-3" /> Add Link
                </button>
              </div>

              <Reorder.Group
                axis="y"
                values={formData.social_links}
                onReorder={(newLinks) =>
                  setFormData({ ...formData, social_links: newLinks })
                }
                className="space-y-3 max-w-2xl"
              >
                {(formData.social_links || []).map((link, index) => (
                  <Reorder.Item
                    key={link.localId}
                    value={link}
                    className="flex gap-2 items-center group"
                  >
                    <div className="cursor-grab active:cursor-grabbing p-1 text-zinc-700 hover:text-zinc-400 transition-colors flex-shrink-0">
                      <GripVertical className="w-4 h-4" />
                    </div>

                    <div className="flex-1 flex gap-2 items-center bg-zinc-950 border border-zinc-800 p-2 rounded-lg min-w-0">
                      <CustomSelect
                        value={link.platform}
                        onChange={(val) => {
                          const newLinks = [...(formData.social_links || [])];
                          newLinks[index].platform = val;
                          setFormData({ ...formData, social_links: newLinks });
                        }}
                        options={socialOptions}
                        className="w-16 md:w-36 flex-shrink-0"
                        hideLabelMobile={true}
                      />
                      <div className="h-4 w-px bg-zinc-800 mx-1 flex-shrink-0" />
                      <input
                        type="url"
                        placeholder="https://..."
                        className="flex-1 min-w-0 bg-transparent border-none text-sm text-white outline-none font-headline focus:ring-0"
                        value={link.url}
                        onChange={(e) => {
                          const newLinks = [...(formData.social_links || [])];
                          newLinks[index].url = e.target.value;
                          setFormData({ ...formData, social_links: newLinks });
                        }}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const newLinks = (formData.social_links || []).filter(
                          (_, i) => i !== index,
                        );
                        setFormData({ ...formData, social_links: newLinks });
                      }}
                      className="p-2 text-zinc-600 hover:text-red-400 transition-colors opacity-100 md:opacity-0 group-hover:opacity-100 flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </Reorder.Item>
                ))}

                {formData.social_links?.length === 0 && (
                  <div className="py-4 text-center border-2 border-dashed border-zinc-800 rounded-lg">
                    <p className="text-zinc-600 text-[10px] font-headline uppercase tracking-widest">
                      No social links added yet
                    </p>
                  </div>
                )}
              </Reorder.Group>
            </div>

            <div className="space-y-2 col-span-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-headline flex items-center gap-2">
                <FileText className="w-3 h-3" /> Description
              </label>
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] text-zinc-500 font-headline">
                  Provide a detailed description of your server.
                </p>
                <span
                  onClick={() => {
                    if (formData.description.length >= limits.description && !hasPremiumPerks) {
                      toast.info('Explorer+ Feature', {
                        description: 'Upgrade to Explorer+ to increase your description limit to 5,000 characters!'
                      })
                    }
                  }}
                  className={`text-[10px] font-bold font-headline transition-colors ${formData.description.length >= limits.description ? "text-red-400 cursor-pointer hover:text-red-300" : "text-zinc-500"}`}
                >
                  {formData.description.length}/{limits.description}
                </span>
              </div>
              <textarea
                maxLength={limits.description}
                placeholder="Tell players about your server..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white text-[13px] md:text-sm outline-none focus:border-realm-green transition-all font-headline resize-y focus:ring-1 focus:ring-realm-green/30 min-h-[200px]"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              ></textarea>
            </div>

            <div className="space-y-4 col-span-2 pt-6 border-t border-zinc-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest font-headline flex items-center gap-2">
                  <span className="material-symbols-outlined text-[14px]">
                    photo_library
                  </span>{" "}
                  Gallery
                </label>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] text-zinc-500 font-headline uppercase">
                    {formData.gallery.length}/{limits.gallery} pictures
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (formData.gallery.length >= limits.gallery) {
                        if (!hasPremiumPerks) {
                          toast.info('Explorer+ Feature', {
                            description: 'Upgrade to Explorer+ to add up to 5 gallery images!'
                          })
                        } else {
                          toast.warning('Limit Reached', {
                            description: `Maximum of ${limits.gallery} gallery images reached.`
                          })
                        }
                        return
                      }
                      setFormData({
                        ...formData,
                        gallery: [...formData.gallery, ""],
                      })
                    }}
                    className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${formData.gallery.length >= limits.gallery ? "text-zinc-500 hover:text-zinc-400" : "text-realm-green hover:text-[#85fc7e]"} flex items-center gap-1`}
                  >
                    <Plus className="w-3 h-3" /> Add Image
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {formData.gallery.map((url, index) => (
                  <div key={index} className="relative group/gallery">
                    <ImageUpload
                      label={`Image ${index + 1}`}
                      onUpload={(newUrl) => {
                        const newGallery = [...formData.gallery];
                        newGallery[index] = newUrl;
                        setFormData({ ...formData, gallery: newGallery });
                      }}
                      value={url}
                      aspectRatio="square"
                    />
                    {formData.gallery.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newGallery = formData.gallery.filter(
                            (_, i) => i !== index,
                          );
                          setFormData({ ...formData, gallery: newGallery });
                        }}
                        className="absolute -top-2 -right-2 w-7 h-7 bg-zinc-900/90 border border-zinc-800 text-zinc-400 rounded-full flex items-center justify-center opacity-100 md:opacity-0 md:group-hover/gallery:opacity-100 transition-all shadow-xl z-20 hover:text-red-500 hover:border-red-500/50"
                        title="Remove Slide"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-800 flex justify-end gap-3 flex-wrap md:flex-nowrap">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3 rounded-lg font-headline font-bold text-zinc-500 hover:text-white transition-colors whitespace-nowrap"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={submitMutation.isPending}
              className={`bg-[#4EC44E] text-[#002202] px-8 py-3 rounded-lg font-headline font-bold transition-all shadow-lg whitespace-nowrap ${submitMutation.isPending || updateMutation.isPending ? "opacity-50 cursor-not-allowed" : "hover:bg-[#85fc7e] hover:shadow-green-500/20"}`}
            >
              {submitMutation.isPending || updateMutation.isPending
                ? "Saving..."
                : isEditing
                  ? "Save Changes"
                  : "Submit for Review"}
            </motion.button>
          </div>
        </form>
      </FramerIn>
    </AnimatedPage>
  );
}
