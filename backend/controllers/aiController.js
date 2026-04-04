import Groq from 'groq-sdk';
import furModel from '../models/furModel.js';
import orderModel from '../models/orderModel.js';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Get AI furs recommendations with enhanced data
const getAIRecommendation = async (req, res) => {
  try {
    const { message, userId } = req.body;

    // Fetch all available furs with more details
    const furs = await furModel.find({});
    
    // Fetch user's order history if userId provided
    let orderHistory = [];
    if (userId) {
      const orders = await orderModel.find({ userId }).limit(5).sort({ date: -1 });
      orderHistory = orders.map(order => order.items).flat();
    }

    // Prepare fur data with nutrition info
    const furList = fur.map(fur => ({
      id: fur._id,
      name: fur.name,
      category: fur.category,
      price: fur.price,
      description: fur.description,
      image: fur.image,
      // Mock nutrition data (you can add real data to your fur model)
      nutrition: {
        calories: Math.floor(Math.random() * 500) + 200,
        protein: Math.floor(Math.random() * 30) + 5,
        carbs: Math.floor(Math.random() * 50) + 10,
        fat: Math.floor(Math.random() * 20) + 2
      }
    }));

    // Build enhanced context for AI
    const systemPrompt = `You are a helpful furniture recommendation assistant for RentEase, a furniture delivery platform. 
    
Available furniture with details: ${JSON.stringify(furList)}

${orderHistory.length > 0 ? `User's recent orders: ${JSON.stringify(orderHistory)}` : ''}

When recommending furniture:
1. Suggest 3-5 specific dishes from the available menu
2. Include the furniture ID, name, price in ₹
3. Mention key nutrition info (calories, protein)
4. Give brief, friendly reasons for each recommendation
5. If asked about nutrition, provide detailed breakdown
6. If user mentions dietary preferences (veg, spicy, healthy), filter accordingly

Format your response in a conversational way, but include furniture IDs in square brackets like [ID: 673abc...] so we can display images.`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 800
    });

    const aiResponse = completion.choices[0].message.content;

    // Extract fur IDs from response
    const furIdRegex = /\[ID: ([a-f0-9]+)\]/g;
    const mentionedFurIds = [];
    let match;
    
    while ((match = furIdRegex.exec(aiResponse)) !== null) {
      mentionedFurIds.push(match[1]);
    }

    // Get full fur details for mentioned fur
    const recommendedFurs = furs.filter(fur => 
      mentionedFurIds.includes(fur._id.toString())
    );

    res.json({
      success: true,
      response: aiResponse,
      recommendedFurs: recommendedFurs.map(fur => ({
        id: fur._id,
        name: fur.name,
        category: fur.category,
        price: fur.price,
        description: fur.description,
        image: fur.image,
        nutrition: {
          calories: Math.floor(Math.random() * 500) + 200,
          protein: Math.floor(Math.random() * 30) + 5,
          carbs: Math.floor(Math.random() * 50) + 10,
          fat: Math.floor(Math.random() * 20) + 2
        }
      }))
    });

  } catch (error) {
    console.error("AI Error:", error);
    res.json({
      success: false,
      message: "Failed to get AI recommendation",
      error: error.message
    });
  }
};

// Search menu
const searchMenu = async (req, res) => {
  try {
    const { query } = req.body;

    const furs = await furModel.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    }).limit(10);

    res.json({
      success: true,
      results: furs
    });

  } catch (error) {
    console.error("Search error:", error);
    res.json({
      success: false,
      message: "Search failed"
    });
  }
};

// Get quick suggestions
const getQuickSuggestions = async (req, res) => {
  try {
    const suggestions = [
      "What should I order today?",
      "Suggest vegetarian dishes under ₹200",
      "Recommend spicy fur",
      "What's popular on the menu?",
      "Suggest healthy low-calorie options",
      "Show me high-protein meals",
      "Recommend desserts"
    ];

    res.json({
      success: true,
      suggestions
    });

  } catch (error) {
    res.json({
      success: false,
      message: "Failed to get suggestions"
    });
  }
};

export { getAIRecommendation, getQuickSuggestions, searchMenu };