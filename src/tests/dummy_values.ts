export const dummyRecipe = {
    name:"Macaronis",
    url:"http://macaroni",
    time: {
        time: 10,
        unit: "min"
    },
    ingredients: [
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
    ]
}

export const dummyResponse = {
    id:"1",
    name:"Macaronis",
    url:"http://macaroni",
    time: {
        time: 10,
        unit: "min"
    },
    ingredients: [
        {
            name: "pain",
            amount: 100,
            unit: "g",
            name_en:"bread",
            fdc_id: 325871,
            high_confidence: true,
        },
        {
            name: "eau",
            amount: 200,
            unit: "g",
            name_en:"water",
            fdc_id: 334194,
            high_confidence: true,
        }
    ]
}

export const dummyRecipe2 = {
    name:"Macaronis2",
    url:"http://macaroni2",
    time: {
        time: 10,
        unit: "min"
    },
    ingredients: [
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
    time: {
        time: 10,
        unit: "min"
    },
    ingredients: [
        {
            name: "macaroni",
            amount: 100,
            unit: 10
        }
    ]
}
