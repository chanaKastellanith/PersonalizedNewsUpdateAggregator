function generateHTMLContent(newsItems){
    return `
      <h2>Daily News Update</h2>
      <ul style="list-style:none;padding:0;">
        ${newsItems
          .map(
            (item) => `
          <li style="margin-bottom: 20px;border-bottom: 1px solid #ddd;padding-bottom: 15px;">
            <h3>${item.title}</h3>
            <p>${item.description}</p>
            ${
              item.imageUrl !== 'None'
                ? `<img src="${item.imageUrl}" alt="Image" style="max-width: 100%; height: auto; margin: 10px 0;" />`
                : ''
            }
            <a href="${item.url}" style="display:inline-block;padding:10px 15px;color:#fff;background-color:#007bff;border-radius:5px;text-decoration:none;">Read More</a>
          </li>`
          )
          .join('')}
      </ul>
    `;
  };
module.exports = { generateHTMLContent }
  