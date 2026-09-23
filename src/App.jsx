import { useEffect, useMemo, useState } from "react";







import "./App.css";



import "./site-images.css";
import "./steel-fox-light-theme.css";







import { supabase } from "./lib/supabase";

const STEEL_FOX_WHATSAPP_NUMBER = "917309393034";















const defaultProducts = [







  {







    id: 1,







    name: "FORGED TO ADAPT",







    category: "Oversized",







    mrp: 1499,







    sellingPrice: 999,







    image:







      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85",







    sizes: ["S", "M", "L", "XL", "XXL"],







    color: "Black",







    newArrival: true,







  },







  {







    id: 2,







    name: "STAY UNCOMMON",







    category: "Graphic",







    mrp: 1699,







    sellingPrice: 1199,







    image:







      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=900&q=85",







    sizes: ["S", "M", "L", "XL", "XXL"],







    color: "Black",







    newArrival: true,







  },







  {







    id: 3,







    name: "WILD MIND / STEEL SOUL",







    category: "Graphic",







    mrp: 1799,







    sellingPrice: 1299,







    image:







      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=85",







    sizes: ["S", "M", "L", "XL"],







    color: "White",







    newArrival: false,







  },







  {







    id: 4,







    name: "STEEL FOX CORE",







    category: "Basics",







    mrp: 999,







    sellingPrice: 799,







    image:







      "https://images.unsplash.com/photo-1583743814966-8936f37f4678?auto=format&fit=crop&w=900&q=85",







    sizes: ["S", "M", "L", "XL", "XXL"],







    color: "Black",







    newArrival: false,







  },







];















function getDiscount(mrp, sellingPrice) {







  if (mrp <= 0 || sellingPrice >= mrp) {







    return {







      amount: 0,







      percentage: 0,







    };







  }















  const amount = mrp - sellingPrice;







  const percentage = Math.round((amount / mrp) * 100);















  return {







    amount,







    percentage,







  };







}















function formatPrice(price) {







  return new Intl.NumberFormat("en-IN").format(price);







}























const defaultSiteImages = {



  hero: "",
  oversized: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=85",



  graphic: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85",



  basics: "https://images.unsplash.com/photo-1583743814966-8936f37f4678?auto=format&fit=crop&w=900&q=85",



};







const siteImageLabels = {



  hero: "HOME / HERO IMAGE",



  oversized: "OVERSIZED IMAGE",



  graphic: "GRAPHIC IMAGE",



  basics: "BASICS IMAGE",



};







function App() {



  const [menuOpen, setMenuOpen] = useState(false);







  const [productCatalog, setProductCatalog] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);







  const loadProductsFromSupabase = async () => {



    const { data, error } = await supabase



      .from("products")



      .select("*")



      .order("created_at", { ascending: true });







    if (error) {



      console.error("SUPABASE PRODUCTS ERROR:", error);



      setProductCatalog([]);
      setProductsLoading(false);
      return false;



    }







    const products = (data || []).map((product) => ({



      id: product.id,



      name: product.name,



      category: product.category,



      mrp: Number(product.mrp),



      sellingPrice: Number(product.selling_price),



      image: product.image_url || "",



      sizes: Array.isArray(product.sizes) ? product.sizes : [],



      color: product.color || "",



      material: product.material || "",



      newArrival: Boolean(product.new_arrival),
      imageUrls: Array.isArray(product.image_urls) && product.image_urls.length
        ? product.image_urls
        : product.image_url
          ? [product.image_url]
          : [],
      stockStatus: product.stock_status || "in_stock",
      sizeStock: product.size_stock && typeof product.size_stock === "object"
        ? product.size_stock
        : {},



    }));







    setProductCatalog(products);



    setProductsLoading(false);

    return true;



  };
  const [siteImages, setSiteImages] = useState(() => {
    try {
      const saved = localStorage.getItem("steelFoxSiteImages");
      return saved
        ? { ...defaultSiteImages, ...JSON.parse(saved) }
        : defaultSiteImages;
    } catch {
      return defaultSiteImages;
    }
  });
  const [siteImageUploading, setSiteImageUploading] = useState("");

  const [ratingMap, setRatingMap] = useState({});

  const [reviewMap, setReviewMap] = useState({});

  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  const [reviewText, setReviewText] = useState("");

  const [selectedRating, setSelectedRating] = useState(0);

  const [ratedProducts, setRatedProducts] = useState(() => {

    try {

      return JSON.parse(localStorage.getItem("steelFoxRatedProducts") || "{}");

    } catch {

      return {};

    }

  });







  const loadRatings = async () => {

    const { data, error } = await supabase

      .from("product_ratings")

      .select("product_id, rating, review");



    if (error) {

      console.error("SUPABASE RATINGS ERROR:", error);

      return;

    }



    const grouped = {};

    (data || []).forEach((row) => {

      const key = row.product_id;

      if (!grouped[key]) grouped[key] = { sum: 0, count: 0 };

      grouped[key].sum += Number(row.rating) || 0;

      grouped[key].count += 1;

    });

    setRatingMap(grouped);

  
    const reviews = {};
    (data || []).forEach((row) => {
      const review = typeof row.review === "string" ? row.review.trim() : "";
      if (!review) return;
      if (!reviews[row.product_id]) reviews[row.product_id] = [];
      reviews[row.product_id].push({
        rating: Number(row.rating) || 0,
        review,
      });
    });
    setReviewMap(reviews);

};



  const getProductRating = (product) => {

    const live = ratingMap[product.id];

    if (live?.count) return { average: live.sum / live.count, count: live.count };

    return { average: Number(product.rating) || 0, count: Number(product.ratingCount) || 0 };

  };



  const submitRating = async (productId, rating) => {
    if (ratingSubmitting || ratedProducts[productId]) return;

    if (!rating) {
      alert("Please select a star rating.");
      return;
    }

    setRatingSubmitting(true);

    try {
      const { error } = await supabase
        .from("product_ratings")
        .insert({
          product_id: productId,
          rating,
          review: reviewText.trim(),
        });

      if (error) throw error;

      const nextRated = { ...ratedProducts, [productId]: rating };

      setRatedProducts(nextRated);
      localStorage.setItem("steelFoxRatedProducts", JSON.stringify(nextRated));

      setReviewText("");
      setSelectedRating(0);

      await loadRatings();
    } catch (error) {
      console.error("RATING ERROR:", error);
      alert(error.message || "Unable to submit rating.");
    } finally {
      setRatingSubmitting(false);
    }
  };


  const loadSiteSettings = async () => {



    const { data, error } = await supabase



      .from("site_settings")



      .select("*")



      .eq("id", 1)



      .maybeSingle();







    if (error) {



      console.error("SUPABASE SITE SETTINGS ERROR:", error);



      return false;



    }







    if (data) {



      const nextImages = {
        hero: data.hero_image || defaultSiteImages.hero,
        oversized: data.category_oversized_image || defaultSiteImages.oversized,
        graphic: data.category_graphic_image || defaultSiteImages.graphic,
        basics: data.category_basics_image || defaultSiteImages.basics,
      };

      setSiteImages(nextImages);

      try {
        localStorage.setItem("steelFoxSiteImages", JSON.stringify(nextImages));
      } catch {
        // Ignore localStorage errors.
      }



    }







    return true;



  };







  useEffect(() => {



    loadProductsFromSupabase();



    loadSiteSettings();



  }, []);







  const [adminMode, setAdminMode] = useState(() => window.location.hash === "#admin");







  const [adminLoggedIn, setAdminLoggedIn] = useState(false);







  const [adminEmail, setAdminEmail] = useState("");







  const [adminPassword, setAdminPassword] = useState("");







  const [adminProduct, setAdminProduct] = useState(null);







  const [adminError, setAdminError] = useState("");















  const openAdmin = () => {







    window.location.hash = "admin";







    setAdminMode(true);







    setMenuOpen(false);







  };















  const closeAdmin = async () => {







    await supabase.auth.signOut();







    window.location.hash = "home";







    setAdminMode(false);







    setAdminLoggedIn(false);







    setAdminEmail("");







    setAdminPassword("");







    setAdminError("");







  };















  const [imageUploading, setImageUploading] = useState(false);



  const [savingProduct, setSavingProduct] = useState(false);







  const loginAdmin = async (event) => {



    event.preventDefault();







    setAdminError("");







    const email = adminEmail.trim();







    if (!email || !adminPassword) {



      setAdminError("Enter your owner email and password.");



      return;



    }







    const { error } = await supabase.auth.signInWithPassword({



      email,



      password: adminPassword,



    });







    if (error) {



      console.error("SUPABASE OWNER LOGIN ERROR:", error);



      setAdminError(error.message || "Unable to sign in.");



      return;



    }







    setAdminLoggedIn(true);



    setAdminPassword("");



  };







  useEffect(() => {



    let active = true;







    const loadAuthSession = async () => {



      const { data } = await supabase.auth.getSession();







      if (!active) return;







      setAdminLoggedIn(Boolean(data.session));







      if (data.session?.user?.email) {



        setAdminEmail(data.session.user.email);



      }



    };







    loadAuthSession();







    const {



      data: { subscription },



    } = supabase.auth.onAuthStateChange((_event, session) => {



      setAdminLoggedIn(Boolean(session));







      if (session?.user?.email) {



        setAdminEmail(session.user.email);



      }



    });







    return () => {



      active = false;



      subscription.unsubscribe();



    };



  }, []);







  const handleSiteImageChange = async (key, event) => {



    const file = event.target.files?.[0];







    if (!file) return;







    if (!file.type.startsWith("image/")) {



      alert("Please select an image file.");



      event.target.value = "";



      return;



    }







    if (file.size > 8 * 1024 * 1024) {



      alert("Image size must be 8 MB or less.");



      event.target.value = "";



      return;



    }







    setSiteImageUploading(key);







    try {



      const originalName = file.name



        .toLowerCase()



        .replace(/[^a-z0-9.-]+/g, "-")



        .replace(/^-+|-+$/g, "");







      const extension = originalName.includes(".")



        ? originalName.split(".").pop()



        : "jpg";







      const uniqueName =



        typeof crypto !== "undefined" && crypto.randomUUID



          ? crypto.randomUUID()



          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;







      const filePath = `site/${key}-${uniqueName}.${extension}`;







      const { error: uploadError } = await supabase.storage



        .from("product-images")



        .upload(filePath, file, {



          cacheControl: "3600",



          upsert: false,



          contentType: file.type,



        });







      if (uploadError) {



        throw uploadError;



      }







      const {



        data: { publicUrl },



      } = supabase.storage



        .from("product-images")



        .getPublicUrl(filePath);







      const nextImages = { ...siteImages, [key]: publicUrl };







      const { error: settingsError } = await supabase



        .from("site_settings")



        .upsert(



          {



            id: 1,



            hero_image: nextImages.hero,



            category_oversized_image: nextImages.oversized,



            category_graphic_image: nextImages.graphic,



            category_basics_image: nextImages.basics,



            updated_at: new Date().toISOString(),



          },



          { onConflict: "id" }



        );







      if (settingsError) {



        throw settingsError;



      }







      setSiteImages(nextImages);

      try {
        localStorage.setItem("steelFoxSiteImages", JSON.stringify(nextImages));
      } catch {
        // Ignore localStorage errors.
      }




      alert(`${siteImageLabels[key]} updated successfully.`);



    } catch (error) {



      console.error("SITE IMAGE UPLOAD ERROR:", error);



      alert(error.message || "Unable to update showroom image.");



    } finally {



      setSiteImageUploading("");



      event.target.value = "";



    }



  };







  const startNewProduct = () => {

    setAdminProduct({

      id: null,

      name: "NEW PRODUCT",

      category: "Oversized",

      mrp: 0,

      sellingPrice: 0,

      image: "",

      imageUrls: [],

      sizes: ["S", "M", "L", "XL"],

      color: "Black",

      material: "100% Cotton",

      newArrival: true,

      stockStatus: "in_stock",

      sizeStock: { S: true, M: true, L: true, XL: true },

    });

  };



  const editAdminProduct = (product) => {

    const sizes = Array.isArray(product.sizes) ? [...product.sizes] : [];

    const imageUrls = Array.isArray(product.imageUrls) && product.imageUrls.length

      ? [...product.imageUrls]

      : product.image ? [product.image] : [];

    const sizeStock = sizes.reduce((acc, size) => {

      acc[size] = product.sizeStock?.[size] !== false;

      return acc;

    }, {});

    setAdminProduct({

      ...product,

      sizes,

      image: imageUrls[0] || "",

      imageUrls,

      material: product.material || "",

      stockStatus: product.stockStatus || "in_stock",

      sizeStock,

    });

  };



  const handleProductImagesChange = async (event) => {

    const files = Array.from(event.target.files || []);

    if (!files.length || !adminProduct) return;

    const currentCount = adminProduct.imageUrls?.length || (adminProduct.image ? 1 : 0);

    if (currentCount + files.length > 10) {

      alert("Maximum 10 product images allowed.");

      event.target.value = "";

      return;

    }

    if (files.some((file) => !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024)) {

      alert("Only image files up to 5 MB each are allowed.");

      event.target.value = "";

      return;

    }

    setImageUploading(true);

    setAdminError("");

    try {

      const uploaded = [];

      for (const file of files) {

        const originalName = file.name.toLowerCase().replace(/[^a-z0-9.-]+/g, "-").replace(/^-+|-+$/g, "");

        const extension = originalName.includes(".") ? originalName.split(".").pop() : "jpg";

        const uniqueName = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

        const filePath = `products/${uniqueName}.${extension}`;

        const { error: uploadError } = await supabase.storage.from("product-images").upload(filePath, file, {

          cacheControl: "3600", upsert: false, contentType: file.type,

        });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from("product-images").getPublicUrl(filePath);

        uploaded.push(publicUrl);

      }

      setAdminProduct((current) => {

        if (!current) return current;

        const imageUrls = [...(current.imageUrls || (current.image ? [current.image] : [])), ...uploaded].slice(0, 10);

        return { ...current, imageUrls, image: imageUrls[0] || "" };

      });

    } catch (error) {

      console.error("PRODUCT IMAGE UPLOAD ERROR:", error);

      alert(error.message || "Unable to upload product images.");

    } finally {

      setImageUploading(false);

      event.target.value = "";

    }

  };



  const removeAdminProductImage = (index) => {

    setAdminProduct((current) => {

      if (!current) return current;

      const imageUrls = (current.imageUrls || []).filter((_, i) => i !== index);

      return { ...current, imageUrls, image: imageUrls[0] || "" };

    });

  };



  const saveAdminProduct = async () => {

    if (!adminProduct.name.trim()) { alert("Product name is required."); return; }

    if (!(adminProduct.imageUrls?.length || adminProduct.image)) { alert("Please choose at least one product image."); return; }

    if (!adminProduct.material?.trim()) { alert("Material is required."); return; }

    const imageUrls = (adminProduct.imageUrls?.length ? adminProduct.imageUrls : [adminProduct.image]).slice(0, 10);

    const sizes = Array.isArray(adminProduct.sizes) ? adminProduct.sizes : [];

    const sizeStock = sizes.reduce((acc, size) => { acc[size] = adminProduct.sizeStock?.[size] !== false; return acc; }, {});

    const payload = {

      name: adminProduct.name.trim(),

      category: adminProduct.category,

      mrp: Number(adminProduct.mrp) || 0,

      selling_price: Number(adminProduct.sellingPrice) || 0,

      color: adminProduct.color?.trim() || "",

      material: adminProduct.material.trim(),

      sizes,

      image_url: imageUrls[0] || "",

      image_urls: imageUrls,

      new_arrival: Boolean(adminProduct.newArrival),

      stock_status: adminProduct.stockStatus === "out_of_stock" ? "out_of_stock" : "in_stock",

      size_stock: sizeStock,

    };

    setSavingProduct(true);

    try {

      let result;

      if (adminProduct.id) {

        result = await supabase.from("products").update(payload).eq("id", adminProduct.id).select().single();

      } else {

        result = await supabase.from("products").insert(payload).select().single();

      }

      if (result.error) throw result.error;

      await loadProductsFromSupabase();

      setAdminProduct(null);

    } catch (error) {

      console.error("SAVE PRODUCT ERROR:", error);

      alert(error.message || "Unable to save product.");

    } finally { setSavingProduct(false); }

  };



  const deleteAdminProduct = async (id) => {



    if (!window.confirm("Delete this product from the Steel Fox listing?")) {



      return;



    }







    try {



      const { error } = await supabase



        .from("products")



        .delete()



        .eq("id", id);







      if (error) {



        throw error;



      }







      await loadProductsFromSupabase();



    } catch (error) {



      console.error("DELETE PRODUCT ERROR:", error);



      alert(error.message || "Unable to delete product.");



    }



  };







  const [cartItems, setCartItems] = useState([]);







  const [cartOpen, setCartOpen] = useState(false);







  const [activeCategory, setActiveCategory] = useState("All");







  const [selectedProduct, setSelectedProduct] = useState(null);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);







  const [selectedSize, setSelectedSize] = useState("");







  const [quantity, setQuantity] = useState(1);







  const [checkoutOpen, setCheckoutOpen] = useState(false);







  const [orderSubmitted, setOrderSubmitted] = useState(false);







  const [customer, setCustomer] = useState({







    name: "",







    phone: "",







    address: "",







    city: "",







    pincode: "",







  });















  const categories = ["All", "Oversized", "Graphic", "Basics"];















  const filteredProducts = useMemo(() => {







    if (activeCategory === "All") return productCatalog;















    return productCatalog.filter(







      (product) => product.category === activeCategory







    );







  }, [activeCategory, productCatalog]);















  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);















  const cartSubtotal = cartItems.reduce(







    (total, item) => total + item.sellingPrice * item.quantity,







    0







  );















  const cartSavings = cartItems.reduce(







    (total, item) =>







      total +







      (item.mrp - item.sellingPrice) * item.quantity,







    0







  );















  const openProduct = (product) => {
    const imageUrls = Array.isArray(product.imageUrls) && product.imageUrls.length
      ? product.imageUrls
      : product.image
        ? [product.image]
        : [];

    const firstAvailableSize =
      product.stockStatus === "out_of_stock"
        ? ""
        : (product.sizes || []).find((size) => product.sizeStock?.[size] !== false) || "";

    setSelectedProduct({ ...product, imageUrls });
    setSelectedImageIndex(0);
    setSelectedRating(0);
    setReviewText("");
    setSelectedSize(firstAvailableSize);
    setQuantity(1);
  };















  const closeProduct = () => {
    setSelectedProduct(null);
    setSelectedImageIndex(0);
    setSelectedRating(0);
    setReviewText("");
    setSelectedSize("");
    setQuantity(1);
  };















  const addSelectedProductToBag = () => {







    if (!selectedProduct || !selectedSize) return;
    if (selectedProduct.stockStatus === "out_of_stock") {
      alert("This product is currently out of stock.");
      return;
    }
    if (selectedProduct.sizeStock?.[selectedSize] === false) {
      alert(`Size ${selectedSize} is currently out of stock.`);
      return;
    }















    setCartItems((current) => {







      const existing = current.find(







        (item) =>







          item.productId === selectedProduct.id &&







          item.size === selectedSize







      );















      if (existing) {







        return current.map((item) =>







          item.productId === selectedProduct.id &&







          item.size === selectedSize







            ? { ...item, quantity: item.quantity + quantity }







            : item







        );







      }















      return [







        ...current,







        {







          productId: selectedProduct.id,







          name: selectedProduct.name,







          category: selectedProduct.category,







          image: selectedProduct.image,







          mrp: selectedProduct.mrp,







          sellingPrice: selectedProduct.sellingPrice,







          color: selectedProduct.color,







          size: selectedSize,







          quantity,







        },







      ];







    });















    closeProduct();







    setCartOpen(true);







  };















  const updateCartQuantity = (productId, size, change) => {







    setCartItems((current) =>







      current







        .map((item) =>







          item.productId === productId && item.size === size







            ? { ...item, quantity: Math.max(0, item.quantity + change) }







            : item







        )







        .filter((item) => item.quantity > 0)







    );







  };















  const removeFromCart = (productId, size) => {







    setCartItems((current) =>







      current.filter(







        (item) => !(item.productId === productId && item.size === size)







      )







    );







  };















  const openCheckout = () => {







    if (cartItems.length === 0) return;







    setCartOpen(false);







    setCheckoutOpen(true);







    setOrderSubmitted(false);







  };















  const updateCustomer = (field, value) => {







    setCustomer((current) => ({ ...current, [field]: value }));







  };















  const sendOrderToWhatsApp = (event) => {







    event.preventDefault();















    const cleanedPhone = customer.phone.replace(/\D/g, "");







    if (cleanedPhone.length < 10 || cleanedPhone.length > 15) {







      alert("Please enter a valid mobile number.");







      return;







    }















    if (!customer.name.trim() || !customer.address.trim() || !customer.city.trim() || !customer.pincode.trim()) {







      alert("Please fill all customer details.");







      return;







    }















    const orderLines = cartItems







      .map((item, index) => {







        return [







          `${index + 1}. ${item.name}`,







          `Size: ${item.size}`,







          `Color: ${item.color}`,







          `Qty: ${item.quantity}`,







          `Price: ₹${formatPrice(item.sellingPrice * item.quantity)}`,







          `Product photo: ${item.image}`,







        ].join("\n");







      })







      .join("\n\n");















    const message = [







      "*STEEL FOX — NEW ORDER*",







      "",







      "*CUSTOMER DETAILS*",







      `Name: ${customer.name.trim()}`,







      `Mobile: ${cleanedPhone}`,







      `Address: ${customer.address.trim()}`,







      `City: ${customer.city.trim()}`,







      `Pincode: ${customer.pincode.trim()}`,







      "",







      "*ORDER DETAILS*",







      orderLines,







      "",







      `Subtotal / Total: ₹${formatPrice(cartSubtotal)}`,







      `Total Savings: ₹${formatPrice(cartSavings)}`,







      "",







      "Please confirm this order.",







    ].join("\n");















    // Replace this placeholder with the Steel Fox business WhatsApp number,







    // including country code and without + or spaces. Example: 919876543210







    const whatsappNumber = "917309393034";







    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;















    window.open(whatsappUrl, "_blank", "noopener,noreferrer");







    setOrderSubmitted(true);







  };















  if (adminMode) {







    if (!adminLoggedIn) {







      return (







        <div className="admin-page">







          <div className="admin-login-card">







            <button className="admin-back" onClick={closeAdmin}>← Back to Store</button>







            <p className="eyebrow">STEEL FOX / OWNER</p>







            <h1>OWNER LOGIN</h1>







            <p>Manage products, photos, prices, sizes and listings.</p>







            <form onSubmit={loginAdmin}>







              <label>OWNER EMAIL</label>







              <input







                type="email"







                value={adminEmail}







                onChange={(event) => setAdminEmail(event.target.value)}







                placeholder="Enter owner email"







                autoComplete="username"







                autoFocus







                required







              />







              <label>OWNER PASSWORD</label>







              <input







                type="password"







                value={adminPassword}







                onChange={(event) => setAdminPassword(event.target.value)}







                placeholder="Enter owner password"







                autoComplete="current-password"







                required







              />







              {adminError && <div className="admin-error">{adminError}</div>}







              <button className="admin-primary" type="submit">ENTER OWNER PANEL</button>







            </form>







          </div>







        </div>







      );







    }















    return (







      <div className="admin-page">







        <div className="admin-shell">







          <div className="admin-topbar">







            <div>







              <p className="eyebrow">STEEL FOX / ADMINISTRATOR</p>







              <h1>PRODUCT MANAGEMENT</h1>







            </div>







            <button className="admin-secondary" onClick={closeAdmin}>VIEW STORE</button>







          </div>















          <div className="admin-toolbar">







            <div>







              <strong>{productCatalog.length} PRODUCTS</strong>







              <span>Control your public product listing from here.</span>







            </div>







            <button className="admin-primary" onClick={startNewProduct}>+ ADD PRODUCT</button>







          </div>















          <section className="admin-showroom-section">



            <div className="admin-section-heading">



              <div>



                <p className="eyebrow">OWNER CONTROL</p>



                <h2>SHOWROOM IMAGES</h2>



              </div>



              <span>Only the main hero photo can be changed here.</span>



            </div>







            <div className="admin-showroom-grid">



              {(() => {
                const key = "hero";
                const label = siteImageLabels.hero;
                return (
                  <div className="admin-showroom-card" key={key}>
                    <div className="admin-showroom-preview">
                      <img src={siteImages[key]} alt={label} />
                      <span>{label}</span>
                    </div>

                    <label className="admin-image-button">
                      {siteImageUploading === key ? "UPLOADING..." : "CHANGE PHOTO"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => handleSiteImageChange(key, event)}
                        disabled={Boolean(siteImageUploading)}
                      />
                    </label>
                  </div>
                );
              })()}



            </div>



          </section>







          <div className="admin-product-list">







            {productCatalog.map((product) => (







              <div className="admin-product-row" key={product.id}>







                <img src={product.image} alt={product.name} />







                <div className="admin-product-main">







                  <strong>{product.name}</strong>







                  <span>{product.category} · {product.color}</span>







                  <span>₹{formatPrice(product.sellingPrice)} · Sizes: {product.sizes.join(", ")}</span>

                  <span className={product.stockStatus === "out_of_stock" ? "admin-stock out" : "admin-stock"}>

                    {product.stockStatus === "out_of_stock" ? "OUT OF STOCK" : "IN STOCK"}

                  </span>







                </div>







                <div className="admin-row-actions">







                  {product.newArrival && <span className="admin-tag">NEW</span>}







                  <button onClick={() => editAdminProduct(product)}>EDIT</button>







                  <button className="danger" onClick={() => deleteAdminProduct(product.id)}>DELETE</button>







                </div>







              </div>







            ))}







          </div>















          {adminProduct && (







            <div className="admin-editor-backdrop">







              <div className="admin-editor">







                <button className="product-modal-close" onClick={() => setAdminProduct(null)}>×</button>







                <p className="eyebrow">OWNER PANEL</p>







                <h2>{productCatalog.some((item) => item.id === adminProduct.id) ? "EDIT PRODUCT" : "ADD PRODUCT"}</h2>















                <div className="admin-form-grid">







                  <label>PRODUCT NAME<input value={adminProduct.name} onChange={(e) => setAdminProduct({ ...adminProduct, name: e.target.value })} /></label>







                  <label>CATEGORY<select value={adminProduct.category} onChange={(e) => setAdminProduct({ ...adminProduct, category: e.target.value })}><option>Oversized</option><option>Graphic</option><option>Basics</option></select></label>







                  <label>MRP<input type="number" min="0" value={adminProduct.mrp} onChange={(e) => setAdminProduct({ ...adminProduct, mrp: Number(e.target.value) })} /></label>







                  <label>SELLING PRICE<input type="number" min="0" value={adminProduct.sellingPrice} onChange={(e) => setAdminProduct({ ...adminProduct, sellingPrice: Number(e.target.value) })} /></label>







                  <label>COLOR<input value={adminProduct.color} onChange={(e) => setAdminProduct({ ...adminProduct, color: e.target.value })} /></label>







                  <label>SIZES<input value={adminProduct.sizes.join(", ")} onChange={(e) => setAdminProduct({ ...adminProduct, sizes: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} /></label>







                  <label className="admin-full-field">MATERIAL<input value={adminProduct.material || ""} onChange={(e) => setAdminProduct({ ...adminProduct, material: e.target.value })} placeholder="e.g. 100% Cotton, 240 GSM" /></label>







                </div>

                <label className="admin-full-field">PRODUCT PHOTOS — MAX 10</label>

                <input type="file" accept="image/*" multiple onChange={handleProductImagesChange} disabled={imageUploading || (adminProduct.imageUrls?.length || 0) >= 10} />

                <p className="admin-photo-help">{imageUploading ? "Uploading images..." : "Select up to 10 photos. Maximum 5 MB each."}</p>

                <div className="admin-image-grid">

                  {(adminProduct.imageUrls || []).map((url, index) => (

                    <div className="admin-image-item" key={`${url}-${index}`}>

                      <img src={url} alt={`Product ${index + 1}`} />

                      <button type="button" onClick={() => removeAdminProductImage(index)}>REMOVE</button>

                    </div>

                  ))}

                </div>



                <div className="admin-stock-box">

                  <strong>PRODUCT AVAILABILITY</strong>

                  <label className="admin-check"><input type="radio" name="stockStatus" checked={adminProduct.stockStatus !== "out_of_stock"} onChange={() => setAdminProduct({ ...adminProduct, stockStatus: "in_stock" })} /> IN STOCK</label>

                  <label className="admin-check"><input type="radio" name="stockStatus" checked={adminProduct.stockStatus === "out_of_stock"} onChange={() => setAdminProduct({ ...adminProduct, stockStatus: "out_of_stock" })} /> OUT OF STOCK</label>

                </div>



                <div className="admin-size-stock">

                  <strong>SIZE AVAILABILITY</strong>

                  <div className="admin-size-stock-grid">

                    {(adminProduct.sizes || []).map((size) => (

                      <label key={size} className="admin-size-stock-item">

                        <input type="checkbox" checked={adminProduct.sizeStock?.[size] !== false} onChange={(e) => setAdminProduct({ ...adminProduct, sizeStock: { ...adminProduct.sizeStock, [size]: e.target.checked } })} disabled={adminProduct.stockStatus === "out_of_stock"} />

                        {size} — {adminProduct.stockStatus === "out_of_stock" || adminProduct.sizeStock?.[size] === false ? "OUT OF STOCK" : "IN STOCK"}

                      </label>

                    ))}

                  </div>

                </div>



                <label className="admin-check"><input type="checkbox" checked={adminProduct.newArrival} onChange={(e) => setAdminProduct({ ...adminProduct, newArrival: e.target.checked })} /> SHOW NEW BADGE</label>















                <div className="admin-editor-actions">







                  <button className="admin-secondary" type="button" onClick={() => setAdminProduct(null)}>CANCEL</button>







                  <button



                    className="admin-primary"



                    type="button"



                    onClick={saveAdminProduct}



                    disabled={imageUploading || savingProduct}



                  >



                    {savingProduct ? "SAVING..." : "SAVE PRODUCT"}



                  </button>







                </div>







              </div>







            </div>







          )}







        </div>







      </div>







    );







  }















  return (







    <div className="app">







      {/* HEADER */}







      <header className="site-header">







        <a href="#home" className="brand" onClick={() => setMenuOpen(false)}>
          <img
            src="/steel-fox-logo.png"
            alt="Steel Fox"
            className="brand-logo"
          />
          <span
            style={{
              color: "#c7c9cc",
              fontSize: "clamp(18px, 2vw, 30px)",
              fontWeight: 800,
              letterSpacing: "0.14em",
              lineHeight: 1,
              whiteSpace: "nowrap",
              textTransform: "uppercase",
            }}
          >
            STEEL FOX
          </span>
        </a>















        <nav className={`main-nav ${menuOpen ? "open" : ""}`}>







          <a href="#home" onClick={() => setMenuOpen(false)}>







            HOME







          </a>







          <a href="#shop" onClick={() => setMenuOpen(false)}>







            SHOP







          </a>







          <a href="#contact" onClick={() => setMenuOpen(false)}>







            CONTACT







          </a>







        </nav>















        <div className="header-actions">







          <button className="icon-button" aria-label="Search">







            ⌕







          </button>















          <button







            className="cart-button"







            onClick={() => setCartOpen(true)}







            aria-label="Open shopping bag"







          >







            BAG







            <span>{cartCount}</span>







          </button>















          <button







            className="menu-button"







            onClick={() => setMenuOpen((current) => !current)}







            aria-label="Menu"







          >







            ☰







          </button>







        </div>







      </header>















      <main>







        {/* HERO */}







        <section
          className="hero"
          id="home"
          style={{
            position: "relative",
            height: "auto",
            minHeight: 0,
            padding: 0,
            display: "block",
            overflow: "hidden",
            background: "#dfe0e1",
          }}
        >
          {siteImages.hero && (
            <img
              src={siteImages.hero}
              alt="Steel Fox"
              style={{
                display: "block",
                width: "100%",
                height: "auto",
                maxWidth: "100%",
                objectFit: "contain",
              }}
            />
          )}

          <div
            className="hero-content hero-content-minimal"
            style={{
              position: "absolute",
              left: "clamp(18px, 6vw, 90px)",
              bottom: "clamp(22px, 5vw, 52px)",
              width: "auto",
              zIndex: 5,
            }}
          >
            <a href="#shop" className="button button-light">SHOP NOW</a>
          </div>
        </section>

        {/* PRODUCTS */}







        <section className="products-section" id="shop">







          <div className="section-heading products-heading">







            <div>







              <p className="eyebrow">THE COLLECTION</p>







              <h2>FEATURED DROPS</h2>







            </div>















            <p className="section-description">







              Built for your everyday uniform.







            </p>







          </div>















          <div className="category-filter">







            {categories.map((category) => (







              <button







                key={category}







                className={







                  activeCategory === category ? "filter active" : "filter"







                }







                onClick={() => setActiveCategory(category)}







              >







                {category}







              </button>







            ))}







          </div>















          {productsLoading ? (
            <div className="products-loading">LOADING PRODUCTS...</div>
          ) : (
            <div className="product-grid">







            {filteredProducts.map((product) => {







              const discount = getDiscount(







                product.mrp,







                product.sellingPrice







              );















              return (







                <article







                  className="product-card"







                  key={product.id}







                  onClick={() => openProduct(product)}







                >







                  <div className="product-image-wrap">







                    {product.newArrival && (







                      <span className="product-label">NEW</span>







                    )}















                    {discount.percentage > 0 && (







                      <span className="discount-label">







                        {discount.percentage}% OFF







                      </span>







                    )}















                    <img







                      src={product.image}







                      alt={product.name}







                      className="product-image"







                    />















                    <button







                      className="quick-add"







                      onClick={(event) => {







                        event.stopPropagation();







                        openProduct(product);







                      }}







                    >







                      + VIEW PRODUCT







                    </button>







                  </div>















                  <div className="product-info">







                    <div>







                      <p className="product-category">







                        {product.category}







                      </p>















                      <h3>{product.name}</h3>

                      <div className="product-card-rating">★ {getProductRating(product).average ? getProductRating(product).average.toFixed(1) : "New"} {getProductRating(product).count ? `(${getProductRating(product).count})` : ""}</div>

                      <div className={product.stockStatus === "out_of_stock" ? "product-stock out" : "product-stock"}>{product.stockStatus === "out_of_stock" ? "OUT OF STOCK" : "IN STOCK"}</div>







                    </div>















                    <div className="product-price">







                      {discount.percentage > 0 && (







                        <span className="mrp">







                          ₹{formatPrice(product.mrp)}







                        </span>







                      )}















                      <strong>







                        ₹{formatPrice(product.sellingPrice)}







                      </strong>















                      {discount.percentage > 0 && (







                        <span className="off">







                          {discount.percentage}% OFF







                        </span>







                      )}







                    </div>







                  </div>







                </article>







              );







            })}







          </div>
          )}















          <div className="center-button">







            <a href="#shop" className="button button-dark">







              VIEW ALL PRODUCTS







            </a>







          </div>







        </section>

      {/* SHOPPING BAG */}







      {cartOpen && (







        <div className="cart-backdrop" onClick={() => setCartOpen(false)}>







          <aside







            className="cart-drawer"







            role="dialog"







            aria-modal="true"







            aria-label="Shopping bag"







            onClick={(event) => event.stopPropagation()}







          >







            <div className="cart-drawer-header">







              <div>







                <p className="eyebrow">STEEL FOX</p>







                <h2>YOUR BAG</h2>







              </div>















              <button







                className="cart-close"







                onClick={() => setCartOpen(false)}







                aria-label="Close shopping bag"







              >







                ×







              </button>







            </div>















            {cartItems.length === 0 ? (







              <div className="empty-cart">







                <div className="empty-cart-icon">□</div>







                <h3>YOUR BAG IS EMPTY.</h3>







                <p>Add something you actually want to wear.</p>







                <button







                  className="button button-dark empty-cart-button"







                  onClick={() => {







                    setCartOpen(false);







                    document.getElementById("shop")?.scrollIntoView({







                      behavior: "smooth",







                    });







                  }}







                >







                  CONTINUE SHOPPING







                </button>







              </div>







            ) : (







              <>







                <div className="cart-items">







                  {cartItems.map((item) => {







                    const itemDiscount = getDiscount(item.mrp, item.sellingPrice);















                    return (







                      <article







                        className="cart-item"







                        key={`${item.productId}-${item.size}`}







                      >







                        <img







                          src={item.image}







                          alt={item.name}







                          className="cart-item-image"







                        />















                        <div className="cart-item-info">







                          <div className="cart-item-top">







                            <div>







                              <p className="product-category">{item.category}</p>







                              <h3>{item.name}</h3>







                            </div>















                            <button







                              className="remove-item"







                              onClick={() =>







                                removeFromCart(item.productId, item.size)







                              }







                            >







                              REMOVE







                            </button>







                          </div>















                          <div className="cart-item-meta">







                            <span>SIZE: {item.size}</span>







                            <span>COLOR: {item.color}</span>







                          </div>















                          <div className="cart-item-bottom">







                            <div className="cart-quantity">







                              <button







                                onClick={() =>







                                  updateCartQuantity(item.productId, item.size, -1)







                                }







                                aria-label={`Decrease ${item.name}`}







                              >







                                −







                              </button>







                              <strong>{item.quantity}</strong>







                              <button







                                onClick={() =>







                                  updateCartQuantity(item.productId, item.size, 1)







                                }







                                aria-label={`Increase ${item.name}`}







                              >







                                +







                              </button>







                            </div>















                            <div className="cart-item-price">







                              {itemDiscount.percentage > 0 && (







                                <span>₹{formatPrice(item.mrp * item.quantity)}</span>







                              )}







                              <strong>







                                ₹{formatPrice(item.sellingPrice * item.quantity)}







                              </strong>







                            </div>







                          </div>







                        </div>







                      </article>







                    );







                  })}







                </div>















                <div className="cart-summary">







                  <div>







                    <span>SUBTOTAL</span>







                    <strong>₹{formatPrice(cartSubtotal)}</strong>







                  </div>







                  <div>







                    <span>SAVINGS</span>







                    <strong className="cart-saving">− ₹{formatPrice(cartSavings)}</strong>







                  </div>







                  <div className="cart-total">







                    <span>TOTAL</span>







                    <strong>₹{formatPrice(cartSubtotal)}</strong>







                  </div>















                  <button







                    className="checkout-button"







                    onClick={openCheckout}







                  >







                    PROCEED TO CHECKOUT →







                  </button>















                  <p className="checkout-note">







                    Secure order confirmation will be completed on WhatsApp.







                  </p>







                </div>







              </>







            )}







          </aside>







        </div>







      )}















      {/* CHECKOUT */}







      {checkoutOpen && (







        <div className="checkout-backdrop" onClick={() => setCheckoutOpen(false)}>







          <div







            className="checkout-modal"







            role="dialog"







            aria-modal="true"







            aria-label="Steel Fox checkout"







            onClick={(event) => event.stopPropagation()}







          >







            <div className="checkout-header">







              <div>







                <p className="eyebrow">STEEL FOX / CHECKOUT</p>







                <h2>DELIVERY DETAILS</h2>







              </div>







              <button







                className="checkout-close"







                onClick={() => setCheckoutOpen(false)}







                aria-label="Close checkout"







              >







                ×







              </button>







            </div>















            {orderSubmitted ? (







              <div className="checkout-success">







                <div className="success-icon">✓</div>







                <h3>ORDER DETAILS READY.</h3>







                <p>WhatsApp has been opened with your order details.</p>







                <p className="success-note">







                  Product photos are included as image links in the message.







                  Direct photo attachment requires WhatsApp Business API integration.







                </p>







                <button







                  className="checkout-button"







                  onClick={() => setCheckoutOpen(false)}







                >







                  DONE







                </button>







              </div>







            ) : (







              <form className="checkout-form" onSubmit={sendOrderToWhatsApp}>







                <div className="checkout-fields">







                  <label>







                    FULL NAME







                    <input







                      type="text"







                      value={customer.name}







                      onChange={(event) => updateCustomer("name", event.target.value)}







                      placeholder="Enter your full name"







                      required







                    />







                  </label>















                  <label>







                    MOBILE NUMBER







                    <input







                      type="tel"







                      inputMode="numeric"







                      value={customer.phone}







                      onChange={(event) => updateCustomer("phone", event.target.value)}







                      placeholder="Enter mobile number"







                      required







                    />







                  </label>















                  <label className="full-field">







                    FULL ADDRESS







                    <textarea







                      value={customer.address}







                      onChange={(event) => updateCustomer("address", event.target.value)}







                      placeholder="House / Street / Area"







                      rows="3"







                      required







                    />







                  </label>















                  <label>







                    CITY







                    <input







                      type="text"







                      value={customer.city}







                      onChange={(event) => updateCustomer("city", event.target.value)}







                      placeholder="City"







                      required







                    />







                  </label>















                  <label>







                    PINCODE







                    <input







                      type="text"







                      inputMode="numeric"







                      maxLength="6"







                      value={customer.pincode}







                      onChange={(event) => updateCustomer("pincode", event.target.value.replace(/\D/g, "").slice(0, 6))}







                      placeholder="6-digit pincode"







                      required







                    />







                  </label>







                </div>















                <div className="checkout-order-summary">







                  <div className="summary-heading">







                    <span>YOUR ORDER</span>







                    <strong>{cartCount} ITEM{cartCount === 1 ? "" : "S"}</strong>







                  </div>















                  {cartItems.map((item) => (







                    <div className="checkout-product" key={`${item.productId}-${item.size}`}>







                      <img src={item.image} alt={item.name} />







                      <div>







                        <strong>{item.name}</strong>







                        <span>SIZE {item.size} · {item.color} · QTY {item.quantity}</span>







                      </div>







                      <strong>₹{formatPrice(item.sellingPrice * item.quantity)}</strong>







                    </div>







                  ))}















                  <div className="checkout-total-row">







                    <span>TOTAL</span>







                    <strong>₹{formatPrice(cartSubtotal)}</strong>







                  </div>







                </div>















                <button className="whatsapp-order-button" type="submit">







                  CONFIRM ORDER ON WHATSAPP →







                </button>















                <p className="checkout-note">







                  Your order details will be prepared in WhatsApp for final confirmation.







                </p>







              </form>







            )}







          </div>







        </div>







      )}















      {/* PRODUCT DETAILS MODAL */}







      {selectedProduct && (







        <div className="product-modal-backdrop" onClick={closeProduct}>







          <div







            className="product-modal"







            role="dialog"







            aria-modal="true"







            aria-label={selectedProduct.name}







            onClick={(event) => event.stopPropagation()}







          >







            <button







              className="product-modal-close"







              onClick={closeProduct}







              aria-label="Close product details"







            >







              ×







            </button>















            <div className="product-modal-gallery">

              <div className="product-modal-image-wrap">

                {selectedProduct.newArrival && <span className="product-label">NEW</span>}

                {getDiscount(selectedProduct.mrp, selectedProduct.sellingPrice).percentage > 0 && (

                  <span className="discount-label">{getDiscount(selectedProduct.mrp, selectedProduct.sellingPrice).percentage}% OFF</span>

                )}

                <img
                  src={selectedProduct.imageUrls?.[selectedImageIndex] || selectedProduct.image}
                  alt={selectedProduct.name}
                  className="product-modal-image"
                />

              </div>

              {(selectedProduct.imageUrls?.length > 1) && (

                <div className="product-thumbnails">

                  {selectedProduct.imageUrls.map((url, index) => (

                    <button
                      key={`${url}-${index}`}
                      type="button"
                      className={`product-thumbnail-button${selectedImageIndex === index ? " active" : ""}`}
                      onClick={() => setSelectedImageIndex(index)}
                      aria-label={`View product photo ${index + 1}`}
                    >
                      <img src={url} alt={`${selectedProduct.name} ${index + 1}`} />
                    </button>

                  ))}

                </div>

              )}

            </div>



            <div className="product-modal-content">







              <p className="product-category">







                {selectedProduct.category}







              </p>















              <h2>{selectedProduct.name}</h2>



              <div className="modal-rating">

                <span>★ {getProductRating(selectedProduct).average ? getProductRating(selectedProduct).average.toFixed(1) : "New"}</span>

                <small>{getProductRating(selectedProduct).count ? `${getProductRating(selectedProduct).count} ratings` : "No ratings yet"}</small>

              </div>



              <div className="rating-input">
                <span>RATE THIS PRODUCT</span>

                <div>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      disabled={ratingSubmitting || Boolean(ratedProducts[selectedProduct.id])}
                      className={(
                        (ratedProducts[selectedProduct.id] || selectedRating) >= star
                          ? "rated"
                          : ""
                      )}
                      onClick={() => setSelectedRating(star)}
                    >
                      ★
                    </button>
                  ))}
                </div>

                {!ratedProducts[selectedProduct.id] && (
                  <>
                    <textarea
                      value={reviewText}
                      onChange={(event) => setReviewText(event.target.value)}
                      placeholder="Product kaisa laga? Apna review likhiye..."
                      maxLength={500}
                      rows={4}
                      className="product-review-input"
                      disabled={ratingSubmitting}
                    />

                    <button
                      type="button"
                      className="product-review-submit"
                      disabled={ratingSubmitting || !selectedRating}
                      onClick={() => submitRating(selectedProduct.id, selectedRating)}
                    >
                      {ratingSubmitting ? "SUBMITTING..." : "SUBMIT REVIEW"}
                    </button>
                  </>
                )}

                {ratedProducts[selectedProduct.id] && (
                  <small className="review-submitted">
                    Thanks for your review.
                  </small>
                )}
              </div>


              {(reviewMap[selectedProduct.id] || []).length > 0 && (
                <div className="customer-reviews">
                  <div className="customer-reviews-heading">
                    <span>CUSTOMER REVIEWS</span>
                    <strong>{reviewMap[selectedProduct.id].length}</strong>
                  </div>

                  <div className="customer-reviews-list">
                    {reviewMap[selectedProduct.id].slice(0, 5).map((item, index) => (
                      <article className="customer-review" key={`${item.review}-${index}`}>
                        <div className="customer-review-stars">
                          {"★".repeat(Math.max(0, Math.min(5, item.rating)))}
                        </div>
                        <p>{item.review}</p>
                      </article>
                    ))}
                  </div>

                  {reviewMap[selectedProduct.id].length > 5 && (
                    <small className="customer-review-note">
                      Showing the latest 5 reviews.
                    </small>
                  )}
                </div>
              )}

              <div className="product-modal-price">







                {getDiscount(







                  selectedProduct.mrp,







                  selectedProduct.sellingPrice







                ).percentage > 0 && (







                  <span className="modal-mrp">







                    ₹{formatPrice(selectedProduct.mrp)}







                  </span>







                )}















                <strong>







                  ₹{formatPrice(selectedProduct.sellingPrice)}







                </strong>















                {getDiscount(







                  selectedProduct.mrp,







                  selectedProduct.sellingPrice







                ).percentage > 0 && (







                  <span className="modal-off">







                    {







                      getDiscount(







                        selectedProduct.mrp,







                        selectedProduct.sellingPrice







                      ).percentage







                    }% OFF







                  </span>







                )}







              </div>















              <p className="modal-saving">







                You save ₹







                {formatPrice(







                  getDiscount(







                    selectedProduct.mrp,







                    selectedProduct.sellingPrice







                  ).amount







                )}







              </p>



              <div className={selectedProduct.stockStatus === "out_of_stock" ? "stock-message out" : "stock-message"}>

                {selectedProduct.stockStatus === "out_of_stock" ? "OUT OF STOCK" : "IN STOCK — SELECT YOUR SIZE"}

              </div>















              <div className="product-option">







                <div className="option-heading">







                  <span>SIZE</span>







                  <strong>{selectedSize || "Select size"}</strong>







                </div>















                <div className="size-options">







                  {selectedProduct.sizes.map((size) => {
                    const sizeAvailable =
                      selectedProduct.stockStatus !== "out_of_stock" &&
                      selectedProduct.sizeStock?.[size] !== false;

                    return (
                      <button
                        key={size}
                        type="button"
                        disabled={!sizeAvailable}
                        className={[
                          "size-button",
                          selectedSize === size ? "selected" : "",
                          !sizeAvailable ? "out-of-stock" : "",
                        ].filter(Boolean).join(" ")}
                        onClick={() => {
                          if (sizeAvailable) setSelectedSize(size);
                        }}
                      >
                        {size}
                      </button>
                    );
                  })}







                </div>







              </div>















              <div className="product-option">







                <div className="option-heading">







                  <span>COLOR</span>







                  <strong>{selectedProduct.color}</strong>







                </div>







              </div>















              <div className="quantity-row">







                <span>QUANTITY</span>















                <div className="quantity-control">







                  <button







                    onClick={() =>







                      setQuantity((current) => Math.max(1, current - 1))







                    }







                    aria-label="Decrease quantity"







                  >







                    −







                  </button>















                  <strong>{quantity}</strong>















                  <button







                    onClick={() =>







                      setQuantity((current) => current + 1)







                    }







                    aria-label="Increase quantity"







                  >







                    +







                  </button>







                </div>







              </div>















              <button







                className="modal-add-button"







                onClick={addSelectedProductToBag}







                disabled={
                  !selectedSize ||
                  selectedProduct.stockStatus === "out_of_stock" ||
                  selectedProduct.sizeStock?.[selectedSize] === false
                }
              >
                {selectedProduct.stockStatus === "out_of_stock"
                  ? "OUT OF STOCK"
                  : selectedSize && selectedProduct.sizeStock?.[selectedSize] === false
                    ? "SIZE OUT OF STOCK"
                    : "ADD TO BAG — ₹"}







                {formatPrice(







                  selectedProduct.sellingPrice * quantity







                )}







              </button>







            </div>







          </div>







        </div>







      )}



















            </main>

{/* FOOTER */}







      <section className="contact-section" id="contact">
  <div className="contact-inner">
    <div className="contact-heading">
      <p className="eyebrow">STEEL FOX / CONTACT</p>
      <h2>LET'S TALK.</h2>
      <p>Questions about products, sizes, orders or anything else? Contact Steel Fox directly on WhatsApp.</p>
    </div>
    <div className="contact-actions">
      <a className="contact-card" href={`https://wa.me/${STEEL_FOX_WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello Steel Fox, I have a question about your products.")}`} target="_blank" rel="noreferrer">
        <span className="contact-card-label">WHATSAPP</span>
        <strong>CHAT WITH STEEL FOX →</strong>
        <span>Get a quick reply about products, sizes and orders.</span>
      </a>
      <a className="contact-card" href="#shop">
        <span className="contact-card-label">SHOP</span>
        <strong>VIEW PRODUCTS →</strong>
        <span>Explore the latest Steel Fox collection.</span>
      </a>
    </div>
  </div>
</section>

{/* FOOTER */}

<footer className="footer">







        <div className="footer-main">







          <div>







            <div className="footer-brand">STEEL FOX</div>







            <p>BUILT TO ADAPT. MADE TO STAND OUT.</p>







          </div>















          <div className="footer-links">







            <div>







              <h4>SHOP</h4>







              <a href="#shop">All Products</a>







              <a href="#shop">Oversized</a>







              <a href="#shop">Graphic</a>







              <a href="#shop">Basics</a>







            </div>















            <div>







              <h4>INFO</h4>







              <a href="#contact">Contact</a>







              <a href="#contact">Size Guide</a>







              <a href="#contact">Shipping & Returns</a>







            </div>







          </div>







        </div>















        <div className="footer-owner"><button onClick={openAdmin}>OWNER / ADMIN</button></div>















        <div className="footer-bottom">







          <span>© 2026 STEEL FOX. ALL RIGHTS RESERVED.</span>







          <span>INDIA</span>







        </div>







      </footer>







    </div>







  );







}















export default App;
