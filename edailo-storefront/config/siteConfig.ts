import { request } from "https";
import { join } from "path";

// siteConfig.ts
export const siteConfig = {
  companyName: "Edailo",
  metadata: {
    title: "Edailo Store",
    description: "Edailo Market",
  },
  logo: {
    src: "/logo.png",
    alt: "Edailo Store",
  },
  navLinks: {
    home: { label: "Home", href: "/" },
    store: { label: "Store", href: "/store" },
    account: { label: "Account", href: "/account" },
    cart: { label: "Cart", href: "/cart" },
  },
   sideMenuItems: {
    Home: "/",
    Store: "/store",
    Account: "/account",
    Cart: "/cart",
  },
  buttons: {
    logout:"logout",
    edit: "Edit",
    remove:"Remove",
    cancel: "Cancel",
    save: "Save changes",
    signIn: "Sign in",
    join: "Join us",
    joins: "Join",
    notamember:"Not a member?",
    continueShopping: "Continue shopping",
    seeDetails: "See details",
  },
  home:{
    viewall:"View all",
    menu:"Menu",
    cart:{
      
      allproduct:"Go to all products page",
      exploreproducts:"Explore products",
      empty:"Your shopping bag is empty.",
      zero:0,
      gotocart:"Go to cart",
      subTotal:"Subtotal",
      exctax:"(excl. taxes)",
      somethingwrong:"Something went wrong when we tried to transfer your cart",
      language:"Language:"
    }
    ,
    // Hero slides content for homepage
    heroSlides: [
      {
        title: "Freshness You Can Trust, Savings You Will Love!",
        image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=2070",
        cta1: { label: "Shop Now", href: "/store" },
        cta2: { label: "Explore Now", href: "/collections" },
      },
      {
        title: "Premium Quality Groceries Delivered Fresh Daily",
        image: "https://images.unsplash.com/photo-1590779033100-9f60a05a013d?w=2070",
        cta1: { label: "Shop Now", href: "/store" },
        cta2: { label: "Explore Now", href: "/collections" },
      },
      {
        title: "Up to 50% Off on Fresh Produce & Essentials!",
        image: "https://images.unsplash.com/photo-1608686207856-001b95aac8f5?w=2070",
        cta1: { label: "Shop Now", href: "/store" },
        cta2: { label: "Explore Now", href: "/collections" },
      },
    ],
    // Ad banner content for homepage (full width banner)
    adBanner: {
      title: "Limited Time: Free Shipping on Orders Over $50",
      subtitle: "Shop our curated selection — new arrivals added daily",
      cta: { label: "Shop Now", href: "/store" },
      // Optional slides for ad banner (images will be shown like main slider)
      slides: [
        {
          title: "Limited Time: Free Shipping on Orders Over $50",
          image: "https://images.unsplash.com/photo-1523986371872-9d3ba2e2f642?w=2080",
          cta: { label: "Shop Now", href: "/store" },
        },
        {
          title: "New Arrivals — Fresh Everyday",
          image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=2080",
          cta: { label: "Explore", href: "/collections" },
        },
      ],
      heightClass: "h-[44vh] md:h-[50vh]",
    },
  },
  customer:{
    service:"Customer Service",
   help:"You can find frequently asked questions and answers on our customer service page."
  },
  product:{
    allProduct:"All products",
    cretedSucess:"Your  product was successfully created! 🎉",
    original:"Original:",
    information:"Product Information",
    shippingndReturn:"Shipping & Returns",
    material:"Material",
    country:"Country of origin",
    type:"Type",
    weighet:"Weight",
    dimension:"Dimensions",
    fastDelivery:"Fast delivery",
    packageArrive:"  Your package will arrive in 3-5 business days at your pick up location or in the comfort of your home.",
    exchange:"Simple exchanges",
    exchangeProdut:"Is the fit not quite right? No worries - we'll exchange your product for a new one.",
    return:"Easy returns",
    returnRefund:" Just return your product and we'll refund your money. No questions asked – we'll do our best to make sure your return is hassle-free.",
    related:" Related products",
    mightCheck:"You might also want to check out these products.",

    },
    shipping:{
      free:"Free Shipping unlocked!",
      viewchart:"View cart",
      viewProduct:"View products",
    } ,
     cart:{
    shipping:"Shipping",
    discount:"Discount",
    taxes:"Taxes",
    price:"Price",
     subtotal: "Subtotal (excl. shipping and taxes)",
    total:"Total",
    original:"Original:",
    variant:"Variant:",
    item:"Item",
    quantity:"Quantity",
    cart:"Cart",
    summary:"Summary",
    nothingInCart:"You don't have anything in your cart. Let's change that, use the link below to start browsing our products.",
  },
  chechout:{
    delivery:"Delivery",
    shippingmethod:"Shipping method",
    orderdeliver:"How would you like you order delivered",
    pickupOrder:" Pick up your order",
    store:"Store",
    choosestore:"Choose a store near you",
    continuePayment:"Continue to payment",
 shippingaddres:"Shipping Address",
 method:"Method",
 billingaddress:" Billing address",
 continuedelivery:"Continue to delivery",
 contact:" Contact",
 sameaddress:"Billing and delivery address are the same.",
 promocode:"Add Promotion Codes",
 apply:"Apply",
 promoapply:"Promotions applied:",
 removediscountcode:"Remove discount code from order",
 payment:"Payment",
 paymethod:"Payment method",
 giftcard:" Gift card",
 paydetail:" Payment details",
  placeOrder: "Place order",
  selectPaymentMethod: "Select a payment method",
  carddetail:"Enter your card details:",
  inCart:"In your Cart"
  },
  
  review:{
    review:" Review",
    termsAndCondition:"By clicking the Place Order button, you confirm that you have read, understand and accept our Terms of Use, Terms of Sale and Returns Policy and acknowledge that you have read edailo Store's Privacy Policy."
  },
  order:{
    thankYou:"Thank you!",
    orderSucess:"Your order was placed successfully.",
    orderSummary:"Order Summary",
    needhelp:"Need help?",
    contact:"Contact",
    return:" Returns & Exchanges",
    sucessOrder:"Your  order was successfully created! 🎉",
    confirmation:"We have sent the order confirmation details to",
    date:" Order date:",
    number:"Order number:",
    detail:"Order details",
    status:" Order status:",
    paystatus:"Payment status:",
    orderTransferred:"Order transferred successfully!",
    orderdeclined:" Order transfer declined successfully!",
    accept:" Accept transfer",
    decline:" Decline transfer"
  },
  messages: {
    login: {
      welcome: "Welcome back",
      description: "Sign in to access an enhanced shopping experience.",
      error: "Invalid email or password.",
    },
    accountInfo: {
      success: "updated successfully",
     alreadyhaveaccount:" Already have an account?",
     signNew:"  Sign in for a better experience."
    },
    orders: {
      transfer:"Order transfers",
      requested:"requested",
      requestEmail:"Transfer request email sent to ",
      transferforOrder:" Transfer for order",
      request:"Request transfer",
      notFound:"Can't find the order you are looking for",
      connectOrder:  "Connect an order to your account.",
      gotoorder:"Go to order #",
      number:" Order number",
      overView:"Back to overview",
    detail:"Order details",
      amount:"Total amount",
      placed:"Date placed",
      noOrdersTitle: "Nothing to see here",
      noOrdersDescription: "You don't have any orders yet, let us change that :)",
    },
  },
  accountPage: {
    account:"Account",
    profileLabel: "Profile",
    addressesLabel: "Addresses",
    ordersLabel: "Orders",
    overviewLabel: "Overview",
    completedText: "Completed",
    savedText: "Saved",
    recentOrdersLabel: "Recent orders",
    signedInAsLabel: "Signed in as:",
  },
   register: {
    registerTitle: "Become a edailo Store Member",
    registerDescription:
      "Create your edailo Store Member profile, and get access to an enhanced shopping experience.",
    createAccount:" By creating an account, you agree to edailo Store's",
    alreadymember: "Already a member?",
    registerSwitchText: "Don’t have an account?",
  },
  rules:{
    privacy:"Privacy Policy",
    terms :"Terms of Use"
  },
  checkout: {
    backToCartText: "Back to shopping cart",
    backText: "Back",
  },
  footer: {
    copyrightText: "All rights reserved.",
    company: {
      name: "EDAiLO Market",
      description:
        "EDAiLO Market is a modern e-commerce platform providing a seamless and secure shopping experience.",
    },
    columns: [
      {
        title: "Company",
        links: [
          { label: "About Us", href: "/about" },
          { label: "Contact", href: "/contact" },
          { label: "Products", href: "/products" },
        ],
      },
      {
        title: "Support",
        links: [
          { label: "Privacy Policy", href: "/privacy-policy" },
          { label: "Terms & Conditions", href: "/terms" },
          { label: "FAQ", href: "/faq" },
        ],
      },
    ],
    social: [
      { label: "Facebook", href: "#" },
      { label: "Instagram", href: "#" },
      { label: "Twitter", href: "#" },
    ],
  },
} 
