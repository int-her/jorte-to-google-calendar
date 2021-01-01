import moment from 'moment';
import { readFile, writeFile } from './helper';

const GOOGLE_DATE_FORMAT = 'MM/DD/YYYY'
const GOOGLE_TIME_FORMAT = 'HH:mm A'
const MIDNIGHT_TIME = '00:00 AM'

const googleCalendarEventHeader = [
  { id: 'subject', title: 'Subject' },
  { id: 'startDate', title: 'Start Date' },
  { id: 'startTime', title: 'Start Time' },
  { id: 'endDate', title: 'End Date' },
  { id: 'endTime', title: 'End Time' },
  { id: 'allDayEvent', title: 'All Day Event' },
  { id: 'description', title: 'Description' },
  { id: 'location', title: 'Location' },
]

interface GoogleCalendarEvent {
  title: string
  dateFrom: number
  dateTo: number
  isAllday: boolean
  content: string | undefined
  location: string | undefined
  isFiltered: boolean
}

// settings
const jorteFilePath: string = 'json/sample.json' // json
const googleFilePath: string = 'csv/sample.csv' // csv
const isMidnightEventToAllDayEvent: boolean = true
const includeKeywords: string[] = []
const excludeKeywords: string[] = []

const main = async () => {
  const fileData = await readFile(jorteFilePath)
  const events = JSON.parse(fileData)
  console.log('# of events:', events.length);

  if (includeKeywords.length) {
    events.forEach((event: GoogleCalendarEvent) => {
      event.isFiltered = !includeKeywords.some(keyword => event.title.includes(keyword))
    })
  } else {
    events.forEach((event: GoogleCalendarEvent) => {
      event.isFiltered = false
    })
  }

  if (excludeKeywords.length) {
    events.forEach((event: GoogleCalendarEvent) => {
      if (includeKeywords.some(keyword => event.title.includes(keyword))) {
        event.isFiltered = true
      }
    })
  }

  const convertedEvents = events.filter((event: GoogleCalendarEvent) => !event.isFiltered).map((event: GoogleCalendarEvent) => {
    const startDateTimeMoment = moment(new Date(event.dateFrom))
    const startDate = startDateTimeMoment.format(GOOGLE_DATE_FORMAT);
    const startTime = startDateTimeMoment.format(GOOGLE_TIME_FORMAT);

    const endDateTimeMoment = moment(new Date(event.dateTo))
    const endDate = endDateTimeMoment.format(GOOGLE_DATE_FORMAT);
    const endTime = endDateTimeMoment.format(GOOGLE_TIME_FORMAT);

    const result = {
      subject: event.title,
      startDate,
      startTime: isMidnightEventToAllDayEvent && startTime === MIDNIGHT_TIME ? null : startTime,
      endDate,
      endTime: isMidnightEventToAllDayEvent && endTime === MIDNIGHT_TIME ? null : endTime,
      allDayEvent: event.isAllday,
      description: event.content,
      location: event.location,
    }
    return result;
  })

  await writeFile(googleFilePath, googleCalendarEventHeader, convertedEvents)
}

main()
