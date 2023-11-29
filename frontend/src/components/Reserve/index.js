import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import './Reserve.css'
import { useRef } from 'react';

export function Reserve({ dates, serverErrors, bookingStatus }) {

  const timeOffset = new Date().getTimezoneOffset();

  const [disabledDates, validStartDate, setValidStartDate, validEndDate, setValidEndDate] = dates;

  const changeDateFormat = (dateStr) => {
    return dateStr.split("-").join("/");
  }

  const [startDate, setStartDate] = useState(validStartDate);
  const [onchangeStartDate, setOnchangeStartDate] = useState(validStartDate);
  const [startDateFocused, setStartDateFocused] = useState(false);
  const [endDate, setEndDate] = useState(validEndDate);
  const [onchangeEndDate, setOnchangeEndDate] = useState(validEndDate);
  const [endDateFocused, setEndDateFocused] = useState(false);
  const [selectRange, setSelectRange] = useState(false);
  const [range, setRange] = useState(validStartDate && validEndDate ? [new Date(changeDateFormat(validStartDate)), new Date(changeDateFormat(validEndDate))] : "");
  const [key, setKey] = useState(1);
  const [hoveredDate, setHoveredDate] = useState(null);
  const [validationError, setValidationError] = useState([]);


  const datePickerRef = useRef();
  const datePickerButtonRef = useRef();
  const startDateRef = useRef();
  const endDateRef = useRef();

  const isDateComplete = (dateStr) => {
    const [year, month, date] = dateStr.split("-");
    if (year && month && date && !year.startsWith("0")) {
      return true;
    }
    return false;
  }

  const dateToString = (dateObj) => {
    return `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1).toString().padStart(2, "0")}-${dateObj.getDate().toString().padStart(2, "0")}`
  }

  const startDates = disabledDates.map(range => new Date(changeDateFormat(range[0])).toDateString());
  const endDates = disabledDates.map(range => new Date(changeDateFormat(range[1])).toDateString());

  const findClosestStartDate = (date, dateArr) => {
    const startDates = dateArr.map(range => range[0]);
    let minTimeDiff = Infinity;
    let minTimeDiffInx;
    startDates.forEach((startDate, i) => {
      if (new Date(startDate) >= new Date(date) && new Date(startDate) - new Date(date) < minTimeDiff) {
        minTimeDiff = new Date(startDate) - new Date(date);
        minTimeDiffInx = i;
      }
    });
    return minTimeDiffInx !== undefined ? startDates[minTimeDiffInx] : null;
  }

  function onChange(newRange) {
    if (bookingStatus === "ongoing") {
      newRange = Array.isArray(newRange) ? newRange[1] : newRange
      setStartDate(dateToString(new Date(changeDateFormat(validStartDate))))
      setOnchangeStartDate(dateToString(new Date(changeDateFormat(validStartDate))))
      setEndDate(dateToString(newRange))
      setOnchangeEndDate(dateToString(newRange))
      setSelectRange(false)
      setRange([new Date(changeDateFormat(validStartDate)), newRange])
    } else {
      if (Array.isArray(newRange)) {
        setStartDate(dateToString(newRange[0]))
        setOnchangeStartDate(dateToString(newRange[0]))
        setEndDate(dateToString(newRange[1]))
        setOnchangeEndDate(dateToString(newRange[1]))
        setSelectRange(false)
      } else {
        setStartDate(dateToString(newRange))
        setOnchangeStartDate(dateToString(newRange))
        setEndDate("")
        setOnchangeEndDate("")
        setSelectRange(true)
      }
      setRange(newRange);
    }
  }

  function tileDisabled({ date, view }) {
    if (view === 'month') {
      // if selecting start date
      if (!selectRange && bookingStatus !== "ongoing") {
        return disabledDates.find(([startDate, endDate]) => {
          return date < new Date(changeDateFormat(endDate)) && date >= new Date(changeDateFormat(startDate))
        }) || date < new Date(new Date().setHours(0, -timeOffset, 0, 0));
        // if selecting end date
      } else {
        const closestStartDate = findClosestStartDate(startDate, disabledDates) ? changeDateFormat(findClosestStartDate(startDate, disabledDates)) : null
        return disabledDates.find(([startDate, endDate]) => {
          return date < new Date(changeDateFormat(endDate)) && date > new Date(changeDateFormat(startDate))
        }) || date <= new Date(changeDateFormat(startDate)) || (closestStartDate ? date > new Date(closestStartDate) : null) || date <= new Date(new Date().setHours(0, 0, 0, 0));
      }
    }
  }

  const isStartDateValid = (date) => {
    return bookingStatus === "ongoing" || (!disabledDates.find(([startDate, endDate]) => {
      return new Date(date) < new Date(endDate) && new Date(date) >= new Date(startDate)
    }) && new Date(date) >= new Date(new Date().setHours(0, -timeOffset, 0, 0)) && (endDate ? new Date(date) < new Date(endDate) : true));
  }

  const isEndDateValid = (date) => {
    const closestStartDate = findClosestStartDate(startDate, disabledDates)
    return !disabledDates.find(([startDate, endDate]) => {
      return new Date(date) < new Date(endDate) && new Date(date) > new Date(startDate)
    }) && (startDate ? new Date(date) > new Date(startDate) : true) && (closestStartDate ? new Date(date) <= new Date(closestStartDate) : true) && new Date(date) >= new Date(new Date().setHours(0, -timeOffset, 0, 0));
  }

  const closeWindow = (e) => {
    datePickerRef.current.style.display = "none"
    datePickerButtonRef.current.style.display = "block"
    if (validStartDate && validEndDate) {
      setStartDate(validStartDate)
      setOnchangeStartDate(validStartDate)
      setEndDate(validEndDate)
      setOnchangeEndDate(validEndDate)
      setRange(() => {
        return [new Date(changeDateFormat(validStartDate)), new Date(changeDateFormat(validEndDate))]
      })
      setKey((prev) => prev + 1)
    } else if (!validStartDate && !validEndDate) {
      setStartDate("")
      setOnchangeStartDate("")
      setEndDate("")
      setOnchangeEndDate("")
      setRange("")
      setKey((prev) => prev + 1)
    }
  }

  useEffect(() => {
    const error = []

    if (startDate && !isStartDateValid(startDate)) {
      error.push("Checkin date is unavailable")
    }

    if (endDate && !isEndDateValid(endDate)) {
      error.push("Checkout date is unavailable")
    }

    setValidationError(error)
  }, [startDate, endDate])

  useEffect(() => {
    if (Array.isArray(range)) {
      setValidStartDate(startDate)
      setValidEndDate(endDate)
    } else if (!startDate && !endDate) {
      setValidStartDate("")
      setValidEndDate("")
    }
  }, [range])

  return (
    <>
      <div className="rangeInput">
        <div className="dateInputs">
          <button
            className='datePickerButton'
            ref={datePickerButtonRef}
            onClick={(e) => {
              datePickerRef.current.style.display = "flex"
              e.target.style.display = "none"
              if (bookingStatus === "ongoing") {
                endDateRef.current.focus()
              } else {
                startDateRef.current.focus()
              }
            }}
          >
          </button>
          <div className={`inputBox${startDate && !isStartDateValid(startDate) ? " error" : ""}${bookingStatus === "ongoing" || (endDate && (!isDateComplete(endDate) || !isEndDateValid(endDate))) ? " grayout" : ""}`}>
            <label htmlFor="startDate">Checkin</label>
            <input
              type={startDateFocused ? "date" : "text"}
              name="startDate"
              className='dateField'
              placeholder="Add date"
              value={startDateFocused ? onchangeStartDate : onchangeStartDate ? `${onchangeStartDate.split("-")[1]}/${onchangeStartDate.split("-")[2]}/${onchangeStartDate.split("-")[0]}` : ""}
              ref={startDateRef}
              disabled={bookingStatus === "ongoing" || (endDate && (!isDateComplete(endDate) || !isEndDateValid(endDate)) && isDateComplete(startDate) && isStartDateValid(startDate))}
              onFocus={() => setStartDateFocused(true)}
              onBlur={(e) => {
                setStartDateFocused(false);
                setStartDate(e.target.value)
                if (isDateComplete(e.target.value) && isStartDateValid(e.target.value)) {
                  if (endDate && isEndDateValid(endDate)) {
                    setRange(() => {
                      return [new Date(changeDateFormat(e.target.value)), new Date(changeDateFormat(endDate))]
                    })
                    e.target.blur()
                  } else {
                    setRange(new Date(changeDateFormat(e.target.value)))
                    setSelectRange(true)
                    setTimeout(() => endDateRef.current.focus(), 0)
                  }
                } else {
                  if (e.target.value && startDate !== e.target.value) {
                    setKey((prev) => prev + 1)
                    e.target.focus()
                  }
                }
              }}
              onChange={(e) => {
                setOnchangeStartDate(e.target.value)
                if (!e.target.value) {
                  setRange("")
                  setEndDate("")
                  setOnchangeEndDate("")
                }
              }}
            />
          </div>
          <span></span>
          <div className={`inputBox${endDate && !isEndDateValid(endDate) ? " error" : ""}${(startDateFocused || (startDate && (!isDateComplete(startDate) || !isEndDateValid(startDate)))) ? " grayout" : ""}`}>
            <label htmlFor="endDate">Checkout</label>
            <input
              type={endDateFocused ? "date" : "text"}
              name="endDate"
              className='dateField'
              placeholder="Add date"
              value={endDateFocused ? onchangeEndDate : onchangeEndDate ? `${onchangeEndDate.split("-")[1]}/${onchangeEndDate.split("-")[2]}/${onchangeEndDate.split("-")[0]}` : ""}
              ref={endDateRef}
              disabled={!startDate || ((!isDateComplete(startDate) || !isStartDateValid(startDate)) && (!endDate || endDate && isDateComplete(endDate) && isEndDateValid(endDate)))}
              onFocus={() => setEndDateFocused(true)}
              onBlur={(e) => {
                setEndDateFocused(false);
                setEndDate(e.target.value);
                if (isDateComplete(e.target.value) && isEndDateValid(e.target.value)) {
                  setRange((prev) => {
                    if (Array.isArray(prev)) {
                      prev[1] = new Date(changeDateFormat(e.target.value))
                      return [...prev]
                    } else {
                      return [prev, new Date(changeDateFormat(e.target.value))]
                    }
                  })
                  setSelectRange(false)
                } else {
                  setRange((prev) => prev[0] ? prev[0] : prev);
                  setSelectRange(true)
                  if (e.target.value && endDate !== e.target.value) {
                    e.target.focus()
                  }
                }
              }}
              onChange={(e) => {
                setOnchangeEndDate(e.target.value)
              }}
            />
          </div>
        </div>

      </div>
      <div
        className='datePicker'
        ref={datePickerRef}
      >
        {validationError.length ? <div>
          {
            validationError.map((error, i) => (
              <p key={i} className="validationError"><i className="fa-solid fa-circle-xmark" /> {error}</p>
            ))
          }
        </div> : null}
        {Object.values(serverErrors).length ? <div>
          {
            Object.values(serverErrors).map((error, i) => (
              <p className="serverError"><i className="fa-solid fa-circle-exclamation" /> {error}</p>
            ))
          }
        </div> : null}
        <Calendar
          key={key}
          onChange={onChange}
          value={range}
          minDetail="month"
          tileDisabled={tileDisabled}
          selectRange={selectRange}
          showNeighboringMonth={false}
          tileClassName={({ activeStartDate, date, view }) => {
            if (
              view === 'month'
              && startDates.includes(date.toDateString())
              && (!range || Array.isArray(range))
              && !endDates.includes(date.toDateString())
              && bookingStatus !== "ongoing"
              && date > new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(0, -timeOffset, 0, 0))
            ) {
              return 'startDate'
            } else {
              return null
            }
          }}
          tileContent={({ activeStartDate, date, view }) => {
            if (
              view === 'month'
              && startDates.includes(date.toDateString())
              && !endDates.includes(date.toDateString())
              && date > new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(0, -timeOffset, 0, 0))
            ) {
              return (
                <>
                  <div
                    style={{ zIndex: "1", position: "absolute", top: "0", left: "0", width: "100%", height: "100%" }}
                    onMouseEnter={() => setHoveredDate(date.toDateString())}
                    onMouseLeave={() => setHoveredDate(null)}
                    className='startDateHover'
                  >
                  </div>
                  <div
                    className="popupText"
                    style={{ display: hoveredDate === date.toDateString() && !range ? "flex" : "none" }}
                  >
                    Checkout Only
                  </div>
                </>
              )
            } else {
              return null
            }
          }}
          onClickDay={(value, e) => {
            if (!range) {
              setStartDate(dateToString(value))
              setEndDate("")
              setSelectRange(true)
            } else if (typeof range.getMonth === "function") {
              setEndDate(dateToString(value))
              setSelectRange(false)
            }
          }}
        />
        <div className='datePickerWindowButtons'>
          {bookingStatus === "ongoing" ? null :
            <button
              className='clearDatesButton'
              onClick={() => {
                setStartDate("")
                setOnchangeStartDate("")
                setEndDate("")
                setOnchangeEndDate("")
                setRange("")
                setKey((prev) => prev + 1)
                setSelectRange(false)
                setStartDateFocused(false)
                setEndDateFocused(false)
                setKey((prev) => prev + 1)
              }}
            >
              Clear Dates
            </button>
          }
          <button
            className='closeButton'
            onClick={closeWindow}
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}
