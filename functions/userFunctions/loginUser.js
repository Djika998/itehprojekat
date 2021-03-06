const { validationResult } = require("express-validator");
const User = require("../../schemas/User");
const bcryptjs = require("bcryptjs"); 
const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = async (req, res) => {
  try {
    let { email, password } = req.body;
    let user = await User.findOne({ email });
    let errors = validationResult(req);

    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    if (!user)
      return res.status(404).send("Korsnik sa ovom adresom već postoji");

    let doPasswordsMatch = await bcryptjs.compare(password, user.password);

    if (!doPasswordsMatch)
      return res.status(401).json({ msg: "Lozinke se ne poklapaju" });

    const payload = {
      user: {
        id: user._id,
      },
    };

    jwt.sign(
      payload,
      config.get("jsonWebTokenSecret"),
      { expiresIn: 3600 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (error) {
    console.error(error.message);
    return res.status(500).send("Server error.");
  }
};
