const express = require('express');
const router = express.Router();
const Incidents = require('./incidentsModel');
const {
  checkIncidentExists,
  validateAndSanitizeIncidentQueries,
} = require('../middleware');

// TODO document shape of objects coming and going

/**
 * @swagger
 * /:
 *  GET:
 *    Summary: Path returning all approved incidents in reverse chronological order
 *    tags:
 *      - incidents
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: Success ... returns an array of incident objects
 *      500:
 *        description: Server response error
 */
router.get(
  '/getincidents',
  validateAndSanitizeIncidentQueries,
  (req, res, next) => {
    Incidents.getIncidents()
      .then((incidents) => {
        res.status(200).json(incidents);
      })
      .catch(() => next({ status: 500 }));
  }
);

/**
 * @swagger
 * /{incident_id}:
 *  GET:
 *    Summary: Path returning single incident by incident_id
 *    tags:
 *      - incidents
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: Success ... returns incident object
 *      500:
 *        description: Server response error
 */
router.get('/incident/:incident_id', checkIncidentExists, (req, res, next) => {
  let incident = req.incident;
  if (incident.status === 'approved') {
    res.status(200).json(incident);
  } else {
    next({ status: 400, message: 'Incident unavailable' });
  }
});

/**
 * @swagger
 * /{incident_id}:
 *  GET:
 *    Summary: Path returning timeline of incidents in reverse chronological order.. Limit can be chosen in query or default to 5
 *    tags:
 *      - incidents
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: Success ... returns an array of incident objects
 *      500:
 *        description: Server response error
 */
router.get('/gettimeline', (req, res, next) => {
  let limit = req.query.limit || 5;

  Incidents.getTimelineIncidents(Number(limit))
    .then((incidents) => {
      res.status(200).json(incidents);
    })
    .catch(() => next({ status: 500 }));
});

// eslint-disable-next-line no-unused-vars
router.use((err, _req, res, _next) => {
  res
    .status(err.status || 500)
    .json({ message: err.message || 'Database Error' });
});

module.exports = router;
