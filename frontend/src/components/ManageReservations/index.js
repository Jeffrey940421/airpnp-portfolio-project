import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux"
import * as sessionActions from "../../store/session";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { NoContent } from "../NoContent";
import { useLocation } from "react-router-dom";
import Select from 'react-select';
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import "./ManageReservations.css";
import { set } from "lodash";
import { useModal } from "../../context/Modal";
import { ConfirmDelete } from "../ConfirmDelete";

export function ManageReservations() {
  const dispatch = useDispatch();
  const history = useHistory();
  const location = useLocation();
  const [hasFetched, setHasFetched] = useState(false);
  const spots = useSelector(state => state.session.spots);
  const spotList = Object.values(spots);
  const reservations = useSelector(state => state.session.reservations);
  const reservationsList = Object.values(reservations);
  const defaultSpotId = location.state ? location.state.defaultSpotId : null;
  const [selectedSpot, setSelectedSpot] = useState(null);
  const calendarRef = useRef();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [key, setKey] = useState(0);
  const { setModalContent, setOnModalClose } = useModal();

  const selectMenuStyle = {
    placeholder: (base, state) => ({
      ...base,
      paddingTop: "10px",
    }),
    control: (base, state) => ({
      ...base,
      minHeight: "60px !important",
      maxHeight: "60px",
      backgroundColor: "transparent",
      borderRadius: "10px",
      boxShadow: "none",
      borderColor: state.isFocused ? "black" : "#DDDDDD",
      outline: state.isFocused ? "1.5px solid " : "none",
      '&:hover': {
        borderColor: "black",
        borderWidth: "1.5px"
      },
    }),
    valueContainer: (base, state) => ({
      ...base,
      minHeight: "60px !important",
      maxHeight: "60px",
      position: "relative",
      backgroundColor: "transparent"
    }),
    singleValue: (base, state) => ({
      ...base,
      paddingTop: "10px",
      backgroundColor: "transparent"
    }),
    indicatorContainer: (base, state) => ({
      ...base,
      minHeight: "60px !important",
      maxHeight: "60px",
      backgroundColor: "transparent"
    }),
    input: (base, state) => ({
      ...base,
      minHeight: "60px !important",
      maxHeight: "60px",
      paddingTop: "10px",
      paddingBottom: "0px",
      margin: "0px",
      backgroundColor: "transparent"
    }),
    menu: (base, state) => ({
      ...base,
      borderRadius: "5px"
    }),
    option: (base, state) => ({
      ...base,
      height: "50px",
      display: "flex",
      alignItems: "center"
    })
  }

  const getWidth = () => {
    return Math.max(
      document.body.scrollWidth,
      document.documentElement.scrollWidth,
      document.body.offsetWidth,
      document.documentElement.offsetWidth,
      document.documentElement.clientWidth
    );
  }

  const renderEventContent = (eventInfo) => {
    return (
      <div
        className={`eventButton${eventInfo.event.end.setDate(eventInfo.event.end.getDate() - 1) <= new Date().setHours(0, 0, 0, 0) ? " grayout" : ""}${eventInfo.isStart ? " eventStart" : ""}${eventInfo.isEnd ? " eventEnd" : ""}`}
      >
        <p>{eventInfo.isStart && eventInfo.isEnd ? `Booked by ${eventInfo.event.title}` : eventInfo.isStart ? "Booked by" : eventInfo.event.title}</p>
        {
          eventInfo.event.start > new Date().setHours(0, 0, 0, 0) && eventInfo.isEnd ?
          <button
            onClick={(e) => {
              e.preventDefault();
              setModalContent(<ConfirmDelete booking={eventInfo.event.extendedProps} type="reservation" />);
            }}
          >
            <i className="fa-solid fa-xmark" />
          </button> :
          null
        }
      </div>
    )
  }

  useEffect(() => {
    const refetch = () => {
      setKey(prev => prev + 1);
    }
    window.addEventListener('resize', refetch);

    return () => window.removeEventListener('resize', refetch);
  }, []);

  useEffect(() => {
    dispatch(sessionActions.listSpots())
      .then(() => {
        setHasFetched(true)
      })
      .catch(async (res) => {
        return history.replace(`/error/${res.status}`)
      })
  }, []);

  useEffect(() => {
    if (!selectedSpot) {
      setSelectedSpot(defaultSpotId ? spots[defaultSpotId] : spotList[0]);
    }
  }, [spots])

  useEffect(() => {
    if (selectedSpot) {
      dispatch(sessionActions.listReservations(selectedSpot.id))
        .catch(async (res) => {
          return history.replace(`/error/${res.status}`)
        })
    }
  }, [selectedSpot])

  useEffect(() => {
    setKey(prev => prev + 1);
  }, [reservations])

  if (!hasFetched) {
    return null
  }

  return (
    <div>
      <h1>Manage Reservations</h1>
      {
        spotList.length ?
          <div className="manageReservations">
            <div className="selectMenu">
              <label htmlFor="spot">Place</label>
              <Select
                name="spot"
                onChange={(selectedVal) => {
                  setSelectedSpot(selectedVal.value);
                }}
                value={{ value: selectedSpot, label: selectedSpot ? selectedSpot.name : "" }}
                options={spotList.map(spot => {
                  return { value: spot, label: spot.name }
                })}
                className="selectOptions"
                classNames={{
                  control: (state) => (
                    state.isFocused ? "focusedSelect" : "unfocusedSelect"
                  )
                }}
                autoComplete="one-time-code"
                isSearchable={true}
                isClearable={false}
                styles={selectMenuStyle}
              />
            </div>
            {
              reservationsList.length ?
                <div className="manageReservationsCalendar" key={key}>
                  <FullCalendar
                    ref={calendarRef}
                    initialDate={currentDate}

                    contentHeight="600px"
                    slotDuration={{ hours: 12 }}
                    slotLabelInterval={{ hours: 24 }}
                    buttonText={{ today: "Today" }}
                    eventDidMount={(info) => {
                      const width = Math.max((getWidth() - 160) / 14 + 1, 97);
                      if (info.isStart) {
                        info.el.style.marginLeft = `${width}px`;
                      }
                      if (info.isEnd) {
                        info.el.style.marginRight = `${width}px`;
                      }
                    }}
                    datesSet={(info) => {
                      if (calendarRef.current) {
                        setCurrentDate(calendarRef.current.getApi().getDate());
                      }
                    }}
                    plugins={[dayGridPlugin]}
                    initialView='dayGridMonth'
                    weekends={true}
                    events={reservationsList.map(reservation => {
                      return {
                        extendedProps: reservation,
                        title: `${reservation.User.firstName} ${reservation.User.lastName}`,
                        start: new Date(reservation.startDate.split("-").join("/")),
                        end: new Date(reservation.endDate.split("-").join("/")).setDate(new Date(reservation.endDate.split("-").join("/")).getDate() + 1),
                        allDay: true
                      }
                    })}
                    eventContent={renderEventContent}
                    eventColor="#FF5A5F"
                  />
                </div> :
                <NoContent text="This place hasn't been booked yet" />
            }
          </div> :
          <NoContent text="You haven't created any place yet" />
      }
    </div>
  )
}
