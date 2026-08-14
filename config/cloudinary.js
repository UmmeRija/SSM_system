const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name: "cqzzhuny", api_key: "464146764225485", api_secret: "**********",
});

module.exports = cloudinary; 
