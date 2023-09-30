export const dummyRecipe = {
    name:"Macaronis",
    url:"http://macaroni",
    prepTime:"PT10M",
    recipeIngredient: [
        {
            name: "pain",
            short_name: "pain",
            amount: 100,
            unit: "g"
        },
        {
            name: "eau",
            short_name: "eau",
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
            short_name: "pain",
            amount: 10000,
            unit: "g",
            name_en:"bread",
            fdc_id: 325871,
            high_confidence: true,
        },
        {
            name: "eau",
            short_name: "eau",
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
    short_name: "pain",
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
            name: "eau froide",
            short_name: "eau",
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
  "3/4 cup of sugar",\
  "2\u00a0  brocolis ( moyens\u00a0ou 600 g environ de fleurettes de brocolis)"\
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

export const lotteCourgette = {"@context":"https://schema.org","@type":"Recipe","name":"Brochette de lotte et courgette","description":"Réalisez une brochette de poisson sur de la citronnelle, accompagnée de courgettes miellées.","prepTime":"P0Y0M0DT0H0M1800S","cookTime":"P0Y0M0DT0H0M0S","totalTime":"P0Y0M0DT0H0M1800S","dateCreated":"","thumbnailUrl":"https://adc-dev-images-recipes.s3.eu-west-1.amazonaws.com/284_brochettes_lotte_courgettes.jpg","author":{"@type":"Person","name":"L&apos;atelier des Chefs"},"image":["https://adc-dev-images-recipes.s3.eu-west-1.amazonaws.com/284_brochettes_lotte_courgettes.jpg"],"recipeYield":"6 personnes","recipeCategory":"","recipeCuisine":"","aggregateRating":{"@type":"AggregateRating","ratingCount":364,"bestRating":5,"ratingValue":3.69684},"recipeIngredient":["900 g Filet(s) de lotte ","2 pièce(s) Bâton(s) de citronnelle ","10 cl Vin blanc sec ","3 pièce(s) Oignon(s) nouveau(x) ","4 pièce(s) Courgette(s) ","30 g Beurre doux ","1 gousse(s) Gousse(s) d&apos;ail ","20 g Miel ","5 cl Huile d&apos;olive ","6 pincée(s) Fleur de sel ","6 tour(s) Moulin à poivre "],"recipeInstructions":[{"name":"Étape 1","text":"Éplucher les oignons nouveaux, récupérer la cive sur une dizaine de centimètres et l&apos;émincer séparément. Laver les courgettes et ôter les extrémités, puis les émincer en lamelles de 5 mm d&apos;épaisseur.\nTailler la lotte en cubes de 3 cm de côté environ. Raccourcir les bulbes de citronnelle à la taille des brochettes. Tailler les bâtonnets de citronnelle en 4 dans la longueur et tailler la base dure en pointe.\nPiquer les morceaux de lotte sur les brochettes de citronnelle.\n\nDans une cocotte chaude, ajouter un filet d&apos;huile d&apos;olive et faire suer les oignons avec une pincée de sel. Ajouter l&apos;ail, le miel et les courgettes. Assaisonner et verser un fond d&apos;eau, puis cuire 6 à 8 min jusqu&apos;à évaporation.\n\nDans une poêle chaude, verser un filet d&apos;huile d&apos;olive et colorer les brochettes de lotte pendant 2 min sur chaque face, puis les réserver. Déglacer avec le vin blanc, laisser réduire de moitié et ajouter une noix de beurre frais pour épaissir la sauce. Saler et poivrer la lotte.\n\nMettre la cive d&apos;oignon dans les courgettes et arrêter le feu.\n\nDresser harmonieusement dans des assiettes en posant les brochettes sur les légumes, puis les napper de sauce.","@type":"HowToStep"}]}

export const dummyLDJSON = {
    "cookTime": "PT1H",
    "name": "Moms World Famous Banana Bread",
    "prepTime": "PT15M",
    "recipeIngredient": [
        {
            "amount": 3.5,
            "name": "ripe bananas, smashed",
            "short_name": "ripe bananas, smashed",
            "unit": "",
        }, 
        {
            "amount": 1,
            "name": "egg",
            "short_name": "egg",
            "unit": "",
        },
        {
            "amount": 0.75,
            "name": "sugar",
            "short_name": "sugar",
            "unit": "cup",
    }    ,
        {
            "amount": 2,
            "name": "brocolis",
            "short_name": "brocolis",
            "unit": "",
        },
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
            unit:elt[1],
            short_name:elt[2]
    }
})