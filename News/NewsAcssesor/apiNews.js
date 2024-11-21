const CurrentsAPI = require('currentsapi');
const currentsapi = new CurrentsAPI('C3Uc41Hlkcn-8fQszZ3rB7slPWGXdmXMAg7Q5DDfTq91k90a');
// To query latest news
// All options passed to search are optional
async function getNews(category = 'world', keywords = 'Trump', country = 'US') {
    try {
        const response = await currentsapi.search({
            keywords: keywords,
            language: 'en',
            country: country,
            category: category,
        });
        console.log({response});  
        if (response && response.news) {
            const limitedResults = response.news.slice(0, 5);
            const newsData = limitedResults.map(news => {
                return {
                    title: news.title,
                    description: news.description,
                    url: news.url,
                    imageUrl: news.image
                };
            });
            return newsData;
        } else {
            console.error("No news data available in the response");
            return false;
        }
        
    } catch (error) {
        console.error('Error fetching news:', error);
    }
}

module.exports = { getNews }