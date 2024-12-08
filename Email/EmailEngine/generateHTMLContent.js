function generateHTMLContent(name,newsItems, result) {
  const itemsArray = Array.isArray(newsItems) ? newsItems : Object.values(newsItems).flat();

  if (itemsArray.length === 0) {
    return '<p>No news items available at the moment.</p>';
  }
  return `
    <head>
        <link rel="stylesheet" type="text/css" href="styles.css">
      </head>
    <h2 style="font-size: 24px; color: #333; font-weight: bold; margin-bottom: 20px;">hello ${name } your Daily News Update</h2>
    <div style="background-color: #f8f9fa; padding: 20px; margin-bottom: 20px; border-radius: 8px;">
      <h3 style="font-size: 18px; color: #333; margin: 0 0 15px;">Summary of Today's News:</h3>
      <p style="font-size: 16px; color: #555; line-height: 1.6;">${result}</p>
    </div>
    <ul style="list-style: none; padding: 0;">
      ${itemsArray
        .map((item) => {
          let htmlContent = ''; 

          for (let key in item) {
            const newsItem = item[key];
            const title = newsItem.title;
            const description = newsItem.description;
            const url = newsItem.url;
            const imageUrl = newsItem.imageUrl;

            if (title && description && url) {
              htmlContent += `
                <li style="margin-bottom: 20px; border-bottom: 1px solid #ddd; padding-bottom: 15px;">
                  <h3 style="font-size: 20px; color: #333; margin: 0 0 10px;">${title}</h3>
                  <p style="font-size: 16px; color: #555; line-height: 1.6;">${description}</p>
                  ${imageUrl && imageUrl !== 'None' 
                    ? `<img src="${imageUrl}" alt="Image" style="max-width: 100%; height: auto; margin: 10px 0;" />`
                    : ''
                  }
                  <a href="${url}" style="display: inline-block; padding: 10px 15px; color: #fff; background-color: #007bff; border-radius: 5px; text-decoration: none;">Read More</a>
                </li>
              `;
            }
          }

          return htmlContent; 
        })
        .join('')}
    </ul>
  `;
}
module.exports = { generateHTMLContent }
