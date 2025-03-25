interface TreatmentMap {
  [key: string]: string[];
}

const treatments: TreatmentMap = {
  'acne/rosacea': [
    "Apply a mixture of honey and cinnamon to reduce inflammation.",
    "Use tea tree oil as a natural antibacterial treatment.",
    "Make a face mask with yogurt and lemon juice to exfoliate.",
    "Try aloe vera gel to soothe irritated skin.",
    "Incorporate green tea into your skincare routine for its antioxidant properties.",
    "Use apple cider vinegar diluted with water as a toner."
  ],
  'actinic_keratosos/basal_cell_carcinoma': [
    "Apply a mixture of baking soda and water to help exfoliate and reduce irritation.",
    "Use apple cider vinegar as a topical treatment to promote healing and reduce inflammation.",
    "Incorporate green tea extract into your skincare routine for its antioxidant properties.",
    "Apply aloe vera gel to soothe the skin and promote healing.",
    "Use a paste of turmeric and coconut oil to reduce inflammation and support skin health.",
    "Consider using essential oils like frankincense or tea tree oil for their potential anti-cancer properties."
  ],
  'eczema': [
    "Apply coconut oil to moisturize the skin.",
    "Use aloe vera gel for its soothing properties.",
    "Take oatmeal baths to relieve itching.",
    "Apply a mixture of honey and olive oil for hydration.",
    "Use chamomile tea compresses to reduce inflammation.",
    "Incorporate probiotics into your diet for skin health."
  ],
  'nail_fungus': [
    "Apply a mixture of baking soda and water to help exfoliate and reduce irritation.",
    "Use apple cider vinegar as a topical treatment to promote healing and reduce inflammation.",
    "Incorporate green tea extract into your skincare routine for its antioxidant properties.",
    "Apply aloe vera gel to soothe the skin and promote healing.",
    "Use a paste of turmeric and coconut oil to reduce inflammation and support skin health.",
    "Consider using essential oils like frankincense or tea tree oil for their potential anti-fungal properties."
  ],
  'urticaria/hives': [
    "Apply cold compresses to reduce itching and inflammation.",
    "Take an oatmeal bath to soothe the skin.",
    "Use calamine lotion for relief from itching.",
    "Apply aloe vera gel to reduce inflammation.",
    "Try a baking soda paste for immediate relief.",
    "Use natural antihistamines like nettle tea."
  ],
  'melanma/nevi/moles': [
    "Apply a mixture of turmeric and coconut oil to reduce inflammation.",
    "Use aloe vera gel to soothe the skin and promote healing.",
    "Incorporate green tea into your diet for its antioxidant properties.",
    "Apply a paste of crushed garlic to the area to help fight cancer cells.",
    "Use a blend of honey and olive oil for its moisturizing and healing effects.",
    "Consider using essential oils like frankincense or tea tree oil for their potential anti-cancer properties."
  ],
  'psoriasis/lichen': [
    "Apply moisturizing creams regularly to reduce scaling.",
    "Take warm baths with Epsom salts.",
    "Use aloe vera gel to soothe inflammation.",
    "Apply coconut oil to reduce scaling and itching.",
    "Try apple cider vinegar diluted with water.",
    "Use tea tree oil mixed with carrier oil for its anti-inflammatory properties."
  ],
  'tinea_ringworm/candidiasis': [
    "Apply tea tree oil diluted with carrier oil.",
    "Use apple cider vinegar as an antifungal treatment.",
    "Apply garlic paste to the affected area.",
    "Use turmeric paste for its antifungal properties.",
    "Apply coconut oil for its antimicrobial properties.",
    "Use aloe vera gel to soothe the skin."
  ]
};

export default treatments; 