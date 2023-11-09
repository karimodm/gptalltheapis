// Import the necessary dependencies
import { randomUUID } from 'crypto';

/**
 * Class UberAPIMock that provides plausible responses for Uber API endpoints.
 */
class UberAPIMock {
  /**
   * Returns information about the Uber products offered at a given location.
   * 
   * @param {number} latitude - Latitude component of location.
   * @param {number} longitude - Longitude component of location.
   * @returns {Array} An array of product objects.
   */
  getProducts(latitude, longitude) {
    // Return a plausible response for "/products" endpoint
    return [{
      product_id: randomUUID(),
      description: "The low-cost option",
      display_name: "uberX",
      capacity: "4",
      image: "http://example.com/images/uberX.png"
    }];
  }

  /**
   * Returns an estimated price range for each product offered at a given location.
   * 
   * @param {number} start_latitude - Latitude component of start location.
   * @param {number} start_longitude - Longitude component of start location.
   * @param {number} end_latitude - Latitude component of end location.
   * @param {number} end_longitude - Longitude component of end location.
   * @returns {Array} An array of price estimate objects by product.
   */
  getPriceEstimates(start_latitude, start_longitude, end_latitude, end_longitude) {
    // Return a plausible response for "/estimates/price" endpoint
    return [{
      product_id: randomUUID(),
      currency_code: "USD",
      display_name: "uberX",
      estimate: "$15-20",
      low_estimate: 15,
      high_estimate: 20,
      surge_multiplier: 1
    }];
  }

  /**
   * Returns ETAs for all products offered at a given location.
   * 
   * @param {number} start_latitude - Latitude component of start location.
   * @param {number} start_longitude - Longitude component of start location.
   * @param {string} customer_uuid - Unique customer identifier (optional).
   * @param {string} product_id - Unique identifier representing a specific product (optional).
   * @returns {Array} An array of product objects.
   */
  getTimeEstimates(start_latitude, start_longitude, customer_uuid = null, product_id = null) {
    // Return a plausible response for "/estimates/time" endpoint
    return [{
      product_id: randomUUID(),
      description: "The low-cost option",
      display_name: "uberX",
      capacity: "4",
      image: "http://example.com/images/uberX.png"
    }];
  }

  /**
   * Returns information about the Uber user that has authorized with the application.
   * 
   * @returns {Object} A user profile object.
   */
  getUserProfile() {
    // Return a plausible response for "/me" endpoint
    return {
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@example.com",
      picture: "http://example.com/images/johndoe.png",
      promo_code: "uber123promo"
    };
  }

  /**
   * Returns data about a user's lifetime activity with Uber.
   * 
   * @param {number} offset - Offset the list of returned results by this amount (optional).
   * @param {number} limit - Number of items to retrieve (optional).
   * @returns {Object} An activities object.
   */
  getUserActivity(offset = 0, limit = 5) {
    // Return a plausible response for "/history" endpoint
    return {
      offset,
      limit,
      count: 50,
      history: [{
        uuid: randomUUID()
      }]
    };
  }
}

export default UberAPIMock;