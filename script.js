// ==UserScript==
// @name         Steam Wishlist Exporter
// @icon         http://store.steampowered.com/favicon.ico
// @namespace    Tenebries
// @version      0.1
// @description  Script for Steam that can export date from your wishlist to CSV format.
// @author       tenebries@gmail.com
// @match        *://store.steampowered.com/wishlist/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

jQuery(".controls").prepend(
  '<div class="export_tab" title="Export and download wishlist (CSV format)"><a href="javascript:exportWishlist();"><img src="//steamcommunity-a.akamaihd.net/public/images/skin_1/notification_icon_guide.png"></a></div>'
);

function exportWishlist() {
  "use strict";

  let titles = [];
  let dates = [];
  let steamLinks = [];
  let steamReviews = [];
  let steamReviewsText = [];

  let final_output = [];

  checkData();

  // Scroll and collect data until we hit the bottom of the page
  function scrollScrape() {
    if (window.innerHeight + window.scrollY < document.body.offsetHeight) {
      scrapeData();
      setTimeout(function() {
        scrollScrape();
      }, 100);
    } else {
      console.log("End");
      doneScraping();
    }
  }

  // Scrape titles and release dates
  function scrapeData() {
    titles = document.getElementsByClassName("title");
    dates = document.getElementsByClassName("value release_date");
    steamLinks = document.getElementsByClassName("capsule");
    steamReviews = document.getElementsByClassName("game_review_summary");
    steamReviewsText = document.getElementsByClassName("game_review_summary");

    var output = [];
    var clean_output = [];
    // console.log(titles); // показує тайтли з нашої даної колекції 19 штук

    for (var i = 0; i < titles.length; i++) {
      var temp_title = titles[i].innerText;
      var temp_date = dates[i].innerText;
      let temp_steamLink = steamLinks[i].getAttribute("href");
      let temp_steamReview = steamReviews[i].innerText;
      let temp_steamReviewText = steamReviews[i].getAttribute(
        "data-tooltip-text"
      );
      if (
        typeof temp_title != "undefined" &&
        temp_title.length != 0 &&
        typeof temp_date != "undefined" &&
        temp_date.length != 0
      ) {
        // Strip commas, add "^" for newlines
        temp_title = "^" + temp_title.replace(/,/g, "");
        temp_date = temp_date.replace(/,/g, "");
        temp_steamLink = temp_steamLink.replace(/,/g, "");
        temp_steamReview = temp_steamReview.replace(/,/g, "");
        temp_steamReviewText = temp_steamReviewText.replace(/,/g, "");
        // Trim whitespace
        temp_title = temp_title.trim();
        temp_date = temp_date.trim();
        temp_steamLink = temp_steamLink.trim();
        temp_steamReview = temp_steamReview.trim();
        temp_steamReviewText = temp_steamReviewText.trim();

        if (!final_output.includes(temp_title)) {
          output.push(temp_title);
          output.push(temp_date);
          output.push(temp_steamLink);
          output.push(temp_steamReview);
          output.push(temp_steamReviewText);
        }
      }
    }

    clean_output = cleanArray(output);
    final_output = final_output.concat(clean_output);
    console.log(final_output);

    window.scrollBy(0, 500);
  }

  // Waits until the collection is populated by wishlist.js
  function checkData() {
    titles = document.getElementsByClassName("title");
    dates = document.getElementsByClassName("value release_date");
    steamLinks = document.getElementsByClassName("capsule");
    steamReviews = document.getElementsByClassName("game_review_summary");
    steamReviewsText = document.getElementsByClassName("game_review_summary");
    if (typeof titles[0] == "undefined" || titles[0] == null) {
      console.log("waiting for wishlist.js...");
      setTimeout(function() {
        checkData();
      }, 1000);
    } else {
      console.log("wishlist.js completed.");
      scrollScrape();
    }
  }

  // Removes "undefined" and null entries in the array
  function cleanArray(arr) {
    var len = arr.length,
      i;

    for (i = 0; i < len; i++) {
      if (arr[i] && typeof arr[i] != "undefined") {
        arr.push(arr[i]); // copy non-empty values to the end of the array
      }
    }

    arr.splice(0, len); // cut the array and leave only the non-empty values

    return arr;
  }

  // Generate CSV file and download
  function downloadCSV(args) {
    var data, filename, link;
    // Remove leading '^'
    final_output[0] = final_output[0].slice(1, final_output[0].length);
    var csv = final_output.toString();

    if (csv == null) return;

    // Replaces "^" with newlines
    csv = csv.replace(/\^/g, "\n");
    csv = csv.replace(/,,/g, ",");

    console.log(csv);

    filename = "wishlist.csv";

    if (!csv.match(/^data:text\/csv/i)) {
      csv = "data:text/csv;charset=utf-8," + csv;
    }
    data = encodeURI(csv);

    link = document.createElement("a");
    link.setAttribute("href", data);
    link.setAttribute("download", filename);
    link.click();
  }

  function doneScraping() {
    window.scrollTo(0, 0);

    console.log(final_output);
    console.log("Done!");

    downloadCSV();
  }
}
