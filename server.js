```javascript
require("dotenv").config();

const express = require("express");
const OpenAI = require("openai");

const app = express();

const PORT = process.env.PORT || 3000;


// ============================
// MIDDLEWARE
// ============================

app.use(express.json());


// ============================
// OPENAI CLIENT
// ============================

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});


// ============================
// AI API
// ============================

app.post("/api/chat", async (req, res) => {

    try {

        const message = req.body.message;


        if (!message) {

            return res.status(400).json({
                error: "कृपया प्रश्न लेख्नुहोस्।"
            });

        }


        const response = await client.responses.create({

            model: process.env.OPENAI_MODEL || "gpt-5",

            instructions: `
तिमी Gyan AI हौ।

तिमी Gyan Nepal वेबसाइटका AI Assistant हौ।

प्रयोगकर्ताले नेपालीमा प्रश्न सोधे
नेपालीमै स्पष्ट उत्तर देऊ।

प्रयोगकर्ताले English मा प्रश्न सोधे
English मै उत्तर देऊ।

तिमीले यी विषयमा सहयोग गर्न सक्छौ:

- पढाइ
- Mathematics
- Science
- Computer
- Programming
- HTML
- CSS
- JavaScript
- Python
- General Knowledge
- Nepal GK
- World GK
- इतिहास
- लेखन
- सामान्य जानकारी

Coding प्रश्न आएमा
काम गर्ने code दिनु र
code कसरी चलाउने भनेर बुझाउनु।

Math प्रश्न आएमा
step-by-step समाधान देऊ।

उत्तर स्पष्ट, सजिलो र व्यवस्थित राख।
`,

            input: message

        });


        const answer =
            response.output_text;


        res.json({

            reply:
                answer ||
                "माफ गर्नुहोस्, अहिले उत्तर दिन सकिनँ।"

        });


    } catch (error) {

        console.error(error);


        res.status(500).json({

            error:
                "AI server मा समस्या भयो।"

        });

    }

});


// ============================
// START SERVER
// ============================

app.listen(PORT, () => {

    console.log(
        `Gyan AI server running on port ${PORT}`
    );

});
```
