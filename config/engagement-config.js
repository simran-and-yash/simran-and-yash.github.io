/**
 * SINGLE SOURCE OF TRUTH — SIMRAN & YASH RING CEREMONY / ENGAGEMENT SUITE
 * Powers the interactive Engagement website (index.html), the 1-page clickable
 * smartphone PDF invitation (invite-card.html -> dist/*.pdf), and the
 * 36-second HD Video Invitation (video-invite.html -> dist/*.mp4).
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.ENGAGEMENT_CONFIG = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  return {
    meta: {
      title: "Simran & Yash — Our Ring Ceremony & Engagement Invitation",
      description:
        "Together with our loving families (the Upadhyay & Goyal families), we joyfully invite you to our Ring Ceremony & Engagement on Friday, 27th November 2026 at 7:00 PM onwards at Park Royal, Faridabad.",
      websiteUrl: "https://simran-and-yash.github.io/",
      pdfFileName: "Simran_and_Yash_Engagement_Invite.pdf",
      pdfRelativePath: "dist/Simran_and_Yash_Engagement_Invite.pdf",
      videoFileName: "Simran_and_Yash_Engagement_Video_Invite.mp4",
      videoRelativePath: "dist/Simran_and_Yash_Engagement_Video_Invite.mp4"
    },

    invocation: {
      hindi: "॥ श्री गणेशाय नमः ॥",
      english: "|| Shree Ganeshaya Namah ||"
    },

    couple: {
      monogram: "S & Y",
      displayTitle: "Simran & Yash",
      hashtag: "#SimranSaidYash",
      caricatureImage: "assets/couple-caricature.jpg",
      caricatureAlt:
        "Custom watercolor engagement portrait of Simran and Yash Goyal exchanging a diamond ring beneath a white rose, blush peony, and crystal chandelier arch",
      bride: {
        firstName: "Simran",
        fullName: "Simran",
        mother: "Late Mrs. Neelam",
        father: "Mr. Manoj Kumar",
        parentageLong: "Daughter of Late Mrs. Neelam & Mr. Manoj Kumar",
        parentageShort: "D/o Late Mrs. Neelam & Mr. Manoj Kumar"
      },
      groom: {
        firstName: "Yash",
        fullName: "Yash Goyal",
        mother: "Mrs. Hemlata Goyal",
        father: "Mr. Satish Goyal",
        parentageLong: "Son of Mrs. Hemlata Goyal & Mr. Satish Goyal",
        parentageShort: "S/o Mrs. Hemlata Goyal & Mr. Satish Goyal"
      }
    },

    event: {
      occasionBadge: "Our Ring Ceremony & Dinner",
      occasionTitle: "Our Engagement Celebration",
      inviteProclamation:
        "Together with our loving families, we joyfully request the honour of your gracious presence and heartfelt blessings as we exchange engagement rings and celebrate the beginning of our forever.",
      pdfInviteLine:
        "Together with our loving families, we cordially invite your gracious presence & blessings for our",
      dateDisplay: "Friday, 27th November 2026",
      dateShort: "27th November 2026",
      dayOfWeek: "Friday",
      dayNumber: "27",
      monthName: "November",
      yearNumber: "2026",
      timeDisplay: "7:00 PM Onwards",
      mealDisplay: "Dinner",
      timeAndMeal: "7:00 PM Onwards · Followed by Dinner",
      isoStart: "2026-11-27T19:00:00+05:30",
      isoEnd: "2026-11-27T23:30:00+05:30",
      icsStartUtc: "20261127T133000Z",
      icsEndUtc: "20261127T180000Z"
    },

    venue: {
      name: "Park Royal",
      city: "Faridabad",
      fullTitle: "Park Royal, Faridabad",
      subtitle: "Crystal Ballroom & Evening Lawn, Faridabad, NCR",
      mapUrl: "https://maps.app.goo.gl/xLdzunZ6RtFFszkr5?g_st=aw",
      illustration: "assets/park-royal-venue.jpg",
      illustrationAlt:
        "Evening watercolor illustration of Park Royal, Faridabad illuminated with crystal chandeliers, white floral arches, and candlelit pathways"
    },

    programme: [
      {
        time: "7:00 PM Onwards",
        title: "Welcome & Evening Refreshments",
        detail: "Warm greetings and mocktails beneath crystal chandeliers as we and our families welcome you."
      },
      {
        time: "7:45 PM",
        title: "Our Ring Ceremony (Sagai)",
        detail: "Join us as we exchange engagement rings amidst floral showers and heartfelt blessings from our elders."
      },
      {
        time: "8:30 PM",
        title: "Celebratory Toast & Music",
        detail: "Cake cutting, family portraits, and joyful melodies as we celebrate our new beginning together."
      },
      {
        time: "9:00 PM",
        title: "Grand Celebratory Dinner",
        detail: "A curated gourmet dinner spread shared with our families, relatives, and cherished friends."
      }
    ],

    rsvp: {
      complimentsFrom: "With Best Compliments From Our Families · The Upadhyay & Goyal Families",
      contacts: [
        {
          name: "Mr. Manoj Kumar",
          role: "Bride's Father",
          phoneDisplay: "+91 98914 27828",
          phoneTel: "+919891427828"
        },
        {
          name: "Mr. Satish Goyal",
          role: "Groom's Father",
          phoneDisplay: "+91 93110 16877",
          phoneTel: "+919311016877"
        }
      ]
    }
  };
});
