const Quote = require('../models/Quote');
const Review = require('../models/Review');
const sendEmail = require('../nodemailer');
require('dotenv').config({ path: '../config/config.env' });

function check(params) {
  return params === 'on' ? 'Yes' : '-';
}

exports.getQuote = async (req, res, next) => {
  try {
    const quote = await Quote.find();
    res.status(200).send({ message: 'ok' });
  } catch (error) {
    next(error);
  }
};
exports.postQuote = async (req, res, next) => {
  const quote = await new Quote(req.body);

  const options = {
    subject: `${quote.contact}'s quote`,
    html: `<div
      style="
        box-sizing: border-box;
        width: 100%;
        padding: 5px;
        max-width: 1400px;

        background-color: #25669f;
      "
    >
      <h2 style="color: white; font-size: 23px; text-align: center">
        <a
          href="https://edekmoving.com"
          target="_blank"
          style="color: white; text-decoration: none"
        >
          Edekmoving.com
        </a>
      </h2>
    </div>
    <table style="width: 100%; margin-top: 15px">
      <tr>
        <td
          style="
            background-color: #d3e0ec;
            font-weight: 400;
            font-size: 18px;
            padding: 10px;
            width: 30%;
          "
        >
          Contact
        </td>
        <td
          style="background-color: #f9f9f9;padding-left: 7px; font-size: 18px; font-weight: 600"
        >
       ${quote.contact}
        </td>
      </tr>
      <tr>
        <td
          style="
            background-color: #d3e0ec;
            font-weight: 400;
            font-size: 18px;
            padding: 10px;
            width: 30%;
          "
        >
          Date
        </td>
        <td
          style="background-color: #f9f9f9;padding-left: 7px; font-size: 18px; font-weight: 600"
        >
    ${formatDate(quote.calender)}
        </td>
      </tr>
      <tr>
        <td
          style="
            background-color: #d3e0ec;
            font-weight: 400;
            font-size: 18px;
            padding: 10px;
            width: 30%;
          "
        >
          Address
        </td>
        <td
          style="background-color: #f9f9f9;padding-left: 7px; font-size: 18px; font-weight: 600"
        >
          ${quote.addressFrom}
    ${quote.zipCodeFrom}
        </td>
      </tr>
      <tr>
        <td
          style="
            background-color: #d3e0ec;
            font-weight: 400;
            font-size: 18px;
            padding: 10px;
            width: 30%;
          "
        >
          House
        </td>
        <td
          style="background-color: #f9f9f9;padding-left: 7px; font-size: 18px; font-weight: 600"
        >
  ${check(quote.houseFrom)}
        </td>
      </tr>
      <tr>
        <td
          style="
            background-color: #d3e0ec;
            font-weight: 400;
            font-size: 18px;
            padding: 10px;
            width: 30%;
          "
        >
          Appartement
        </td>
        <td
          style="background-color: #f9f9f9;padding-left: 7px; font-size: 18px; font-weight: 600"
        >
       ${check(quote.appartementFrom)} / 
       ${
         check(quote.elevatorFromNo) === 'off'
           ? 'no-elevator'
           : quote?.fromFloor + 'floor'
       }</span>
    </td>
      </tr>
    </table>
    <table style="width: 100%; margin-top: 15px">
      <tr>
        <td
          style="
            background-color: #d3e0ec;
            font-weight: 400;
            font-size: 18px;
            padding: 10px;
            width: 30%;
          "
        >
          Address
        </td>
        <td
          style="background-color: #f9f9f9;padding-left: 7px; font-size: 18px; font-weight: 600"
        >
         ${quote.addressTo}
    ${quote.zipCodeTo}
        </td>
      </tr>
      <tr>
        <td
          style="
            background-color: #d3e0ec;
            font-weight: 400;
            font-size: 18px;
            padding: 10px;
            width: 30%;
          "
        >
          House
        </td>
        <td
          style="background-color: #f9f9f9;padding-left: 7px; font-size: 18px; font-weight: 600"
        >
     ${check(quote.houseTo)}
        </td>
      </tr>
      <tr>
        <td
          style="
            background-color: #d3e0ec;
            font-weight: 400;
            font-size: 18px;
            padding: 10px;
            width: 30%;
          "
        >
          Appartement

        </td>
        <td
          style="background-color: #f9f9f9;padding-left: 7px; font-size: 18px; font-weight: 600"
        >
        ${check(quote.appartementTo)}
        ${
          quote.appartementTo === 'off'
            ? ''
            : quote?.toFloor + ' floor / elvator ' + check(quote.elevatorToYes)
        }

        </td>
      </tr>
    </table>
    <table style="width: 100%; margin-top: 15px">
      <tr>
        <td
          style="
            background-color: #d3e0ec;
            font-weight: 400;
            font-size: 18px;
            padding: 10px;
            width: 30%;
            vertical-align: top;
          "
        >
          Lists
        </td>
        <td
          style="background-color: #f9f9f9;padding-left: 7px; font-size: 18px; font-weight: 600"
        >
        <ol>
        ${listofItems(quote.listItems)}
        </ol>
        </td>
      </tr>
    </table>`,
  };
  await quote.save();
  await sendEmail(options);
  res.status(201).send({ success: true });
};

exports.postReview = async (req, res, next) => {
  try {
    const review = await Review(req.body);
    await review.save();
    res.json({ success: true, review });
  } catch (error) {
    next(error);
  }
};
exports.getReviews = async (req, res, next) => {
  try {
    const review = await Review.find().sort({ date: -1 });

    const stats = await Review.aggregate([
      {
        $match: { rate: { $gte: 0 } },
      },
      {
        $group: {
          _id: '$rate',
          minPrice: { $min: '$rate' },
          sum: { $sum: '$rate' },
          avgRating: { $avg: '$rate' },
        },
      },
    ]);
    res.status(200).json({ success: true, review, stats });
  } catch (error) {
    console.log(error);
  }
};

function listofItems(list) {
  const items = list.split(',');
  const lists = items
    .map((item) => {
      return `<li>${item}</li>`;
    })
    .join(' ');
  return lists;
}

function formatDate(date) {
  let today = new Date(date);
  return today.toUTCString();
}
