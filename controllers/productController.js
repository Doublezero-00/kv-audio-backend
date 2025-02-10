import Product from "../models/Product.js";

export function addProduct(req, res) {
  if (req.user == null) {
    res.status(401).json({
      message: "Please login and try again",
    });
    return;
  }

  if (req.user.role != "admin") {
    res.status(401).json({
      message: "You are not authorized to add product",
    });
    return;
  }

  const product_data = req.body;
  const product = new Product(product_data);

  product
    .save()
    .then(() => {
      res.json({
        message: "Product added successfully",
      });
    })
    .catch(() => {
      res.json({
        message: "Error while adding product",
      });
    });
}
