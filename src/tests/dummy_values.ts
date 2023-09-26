export const dummyRecipe = {
    name:"Macaronis",
    url:"http://macaroni",
    prepTime:"PT10M",
    recipeIngredient: [
        {
            name: "pain",
            amount: 100,
            unit: "g"
        },
        {
            name: "eau",
            amount: 200,
            unit: "g"
        }
    ],
}

export const dummyResponse = {
    id:"1",
    name:"Macaronis",
    url:"http://macaroni",
    prepTime:"PT10M",
    cookTime:"",
    totalTime:"",
    recipeIngredient: [
        {
            name: "pain",
            amount: 10000,
            unit: "g",
            name_en:"bread",
            fdc_id: 325871,
            high_confidence: true,
        },
        {
            name: "eau",
            amount: 20000,
            unit: "g",
            name_en:"water",
            fdc_id: 334194,
            high_confidence: true,
        }
    ],
    recipeCategory: "",
    recipeCuisine: "",
    recipeInstructions: "",
    recipeYield: ""
}


export const dummyResponseIngredient = {
    name: "pain",
    name_en:"bread",
    fdc_id: 325871,
    high_confidence: true,
    ingredient_id:1
}

export const dummyRecipe2 = {
    name:"Macaronis2",
    url:"http://macaroni2",
    prepTime:"PT10M",
    recipeIngredient: [
        {
            name: "eau",
            amount: 100,
            unit: "g"
        }
    ]
}

export const dummyNotRecipe = {
    title:"Macaronis",
    url:"http://macaroni",
    prepTime:"PT10M",
    recipeIngredient: [
        {
            name: "macaroni",
            amount: 100,
            unit: 10
        }
    ]
}

export const dummyPage = '<head><script type="application/ld+json">{"@context": "https://schema.org",\
"@type": "Recipe",\
"author": "John Smith",\
"cookTime": "PT1H",\
"datePublished": "2009-05-08",\
"description": "This classic banana bread recipe comes from my mom -- the walnuts add a nice texture and flavor to the banana bread.",\
"image": "bananabread.jpg",\
"recipeIngredient": [\
  "3 or 4 ripe bananas, smashed",\
  "1 egg",\
  "3/4 cup of sugar"\
],\
"interactionStatistic": {\
  "@type": "InteractionCounter",\
  "interactionType": "https://schema.org/Comment",\
  "userInteractionCount": "140"\
},\
"name": "Moms World Famous Banana Bread",\
"nutrition": {\
  "@type": "NutritionInformation",\
  "calories": "240 calories",\
  "fatContent": "9 grams fat"\
},\
"prepTime": "PT15M",\
"recipeInstructions": "Preheat the oven to 350 degrees. Mix in the ingredients in a bowl. Add the flour last. Pour the mixture into a loaf pan and bake for one hour.",\
"recipeYield": "1 loaf",\
"suitableForDiet": "https://schema.org/LowFatDiet"\
}</script><script type="application/ld+json">{"test":1}</script></head>'


export const dummyLDJSON = {
    "cookTime": "PT1H",
    "name": "Moms World Famous Banana Bread",
    "prepTime": "PT15M",
    "recipeIngredient": [
        {
            "amount": 3.5,
            "name": "ripe bananas, smashed",
            "unit": "",
        }, 
        {
            "amount": 1,
            "name": "egg",
            "unit": "",
        },
        {
            "amount": 0.75,
            "name": "sugar",
            "unit": "cup",
        }    
    ],
    "recipeInstructions": "Preheat the oven to 350 degrees. Mix in the ingredients in a bowl. Add the flour last. Pour the mixture into a loaf pan and bake for one hour.",
    "recipeYield": "1 loaf",
}

export const dummyIngredients = [
    "2 à 3 morceaux de riz",
    "1-5 quartiers d'orange",
    "1 1/4 tasse de lait",
    "1/2 pastèque",
    "2.4cl jus de papaye",
    "rien",
    "2,4patates",
    "1 1/3 verre"
]

export const dummyIngredientsResponse = [
        [2.5,"morceaux", "riz"],
        [3,"quartiers", "orange"],
        [1.25,"tasse", "lait"],
        [0.5, "", "pastèque"],
        [2.4, "cl", "jus de papaye"],
        [0, "", "rien"],
        [2.4,"","patates"],
        [1.33, "", "verre"],
    ].map((elt) => {
        return {
            amount:elt[0],
            name:elt[2],
            unit:elt[1]
    }
})