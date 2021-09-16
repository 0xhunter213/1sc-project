import SideBar from '../components/layout/sideBar'
import '../assets/css/clend.css'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { collecRdvAction, IndvRdvAction, TypeRdvAction } from '../redux/actions'
import AddIcon from '@material-ui/icons/Add'
import CalendarTodayIcon from '@material-ui/icons/CalendarToday'
import ChoisirRendezVous from './choisirRendezVous'
import RendezVousCollectif from './rendezVousCollectif'
import Paper from '@material-ui/core/Paper'
import Loading from '../components/shared/loading'
import {
  ViewState,
  EditingState,
  IntegratedEditing
} from '@devexpress/dx-react-scheduler'
import {
  Scheduler,
  WeekView,
  Appointments,
  AllDayPanel,
  ViewSwitcher,
  Toolbar,
  DayView,
  TodayButton,
  DateNavigator,
  AppointmentTooltip,
  AppointmentForm,
  ConfirmationDialog
} from '@devexpress/dx-react-scheduler-material-ui'
import moment from 'moment'
import { useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { useEffect } from 'react'
import {
  GET_LES_NIVEAU_DE_LECOLE,
  GET_STUDENT_ALL_INFOS
} from '../graphql/queries/GET_RENDEZVOUS_INFOS'
import { CREATE_RENDEZ_VOUS_INDIV } from '../graphql/mutations/CREATE_RENDEZ_VOUS'

const Calend = () => {
  const {
    loading: loadingStudentInfo,
    error: errorInStudentInfo,
    data: studentDataInfo
    // }
  } = useQuery(GET_STUDENT_ALL_INFOS)
  const {
    loading: loadingLesNiveau,
    error: errorInNiveau,
    data: LesNiveau
    // }
  } = useQuery(GET_LES_NIVEAU_DE_LECOLE)
  const [toggleProgress, setTogglePross] = useState(false)
  const [appointementTitle, setAppointementTitle] = useState('')
  const [studentsAccounts, setStudentsAccounts] = useState([])
  const [lesAnneesDeLecole, setLesAnneesDeLecole] = useState([])
  const [choosedGroupe, setChoosedGroupe] = useState('choisi le groupe')
  const startDayHour = moment('8:00', 'HH:mm').format('HH:mm')
  const endDayHour = moment('16:00', 'HH:mm').format('HH:mm')

  // const [dateDebutIndiv, setDateDebutIndiv] = useState([])
  // const [TempsDebutIndiv, setTempsDebutIndiv] = useState([])
  const [createRendezVousIndvMutation] = useMutation(CREATE_RENDEZ_VOUS_INDIV, {
    onCompleted: ({ createRendezVous: { rendezVous } }) => {
      console.log('this is the data ', rendezVous)
      console.log('this is the title ', appointementTitle)

      const Allappointements = [...appointements]
      Allappointements.push({
        title: appointementTitle,
        startDate: new Date(rendezVous.startDate),
        endDate: new Date(rendezVous.endDate),
        studentId: rendezVous.userId,
        id: rendezVous.id
      })

      setAppointements(Allappointements)
      dispatch(IndvRdvAction())
      setTogglePross(false)
      console.log('the appointements ', Allappointements)
    },
    onerror: (error) => {
      console.error('this is the error ', error)
    }
  })
  const insertRendezVousCollectif = (rendezVous) => {
    const endDateMoment = moment(rendezVous.endDate)
    const dateDifference = moment(rendezVous.endDate).diff(
      moment(rendezVous.startDate),
      'days'
    )

    console.log(
      'date Difference ',
      moment()
        .set({
          date: rendezVous.startDate
        })
        .format('YYYY-MM-DD')
    )
    const days = [...Array(dateDifference + 1).keys()]
    const allRendezVous = []
    let numberOfAppointements = rendezVous.choosedStudents.length
    let numberOfMinutes = 0

    days.map((day) => {
      let startTimeDifference = 0
      if (day === 0) {
        startTimeDifference = moment(endDayHour, 'HH:mm').diff(
          moment(rendezVous.startTime, 'HH:mm'),
          'minutes'
        )
        numberOfMinutes += startTimeDifference
        startTimeDifference = 0
      } else if (day === days.length - 1) {
        startTimeDifference = moment(endDayHour, 'HH:mm').diff(
          moment(rendezVous.endTime, 'HH:mm'),
          'minutes'
        )
        numberOfMinutes += startTimeDifference
        startTimeDifference = 0
      } else {
        startTimeDifference = moment(endDayHour, 'HH:mm').diff(
          moment('8:30', 'HH:mm'),
          'minutes'
        )
        numberOfMinutes += startTimeDifference
        startTimeDifference = 0
      }
    })
    if (Math.floor(numberOfMinutes / 30) < numberOfAppointements) {
      console.log('you must add an end time ', numberOfMinutes)
    } else {
      days.map((day) => {
        let lastUpdatedEndDate = '',
          startDate = ''

        if (day === 0) {
          const [hour, minute] = rendezVous.startTime.split(':')
          startDate = moment().set({
            date: rendezVous.startDate,
            hours: parseInt(hour) + 1,
            minute
          }).toISOString
          allRendezVous.push({
            startDate: startDate,
            endDate: moment(startDate).add(30, 'minutes').toISOString(),
            userId: rendezVous.choosedStudents[0].id,
            title: `Rendez vous de ${rendezVous.choosedStudents[0].nom} ${rendezVous.choosedStudents[0].prenom}`
          })
          startDate = moment(startDate).add(30, 'minutes').toISOString()
          numberOfAppointements -= 1
          console.log(
            'this is test  ',
            moment()
              .set({
                date: rendezVous.startDate,
                hour: parseInt(hour) + 1,
                minute
              })
              .toISOString()
          )
        } else if (day === days.length - 1) {
        }
      })
    }

    // console.log('this is the start ', startTimeDifference)
  }
  const [appointements, setAppointements] = useState([])
  const [currentDate, setCurrentDate] = useState(moment().format('YYYY-MM-DD'))
  useEffect(() => {
    if (!errorInStudentInfo && !loadingStudentInfo) {
      const {
        allUserAccounts: { nodes }
      } = studentDataInfo
      setStudentsAccounts(nodes)
    }
  }, [studentDataInfo])

  useEffect(() => {
    if (!errorInNiveau && !loadingLesNiveau) {
      const annees = []
      const {
        allEcoleNiveaus: { nodes }
      } = LesNiveau
      nodes.map((annee) => {
        annees.push({
          niveau: annee.niveau,
          title: annee.description,
          groupes: [...Array(annee.totalGroupes + 1).keys()].slice(1)
        })
      })
      console.log('les annee de lecole sont ', annees)
      setLesAnneesDeLecole(annees)
    }
  }, [LesNiveau])

  const messages = {
    moreInformationLabel: ''
  }
  const TextEditor = (props) => {
    // eslint-disable-next-line react/destructuring-assignment
    if (props.type === 'multilineTextEditor') {
      return null
    }
    return <AppointmentForm.TextEditor {...props} />
  }

  const BasicLayout = ({ onFieldChange, appointmentData, ...restProps }) => {
    const PatientInfo = { appointmentData }
    const onFirstNameFieldChange = (nextValue) => {
      onFieldChange({
        PatienInfo: nextValue
      })
    }

    return (
      <AppointmentForm.BasicLayout
        appointmentData={appointmentData}
        onFieldChange={onFieldChange}
        {...restProps}
      >
        <AppointmentForm.Label text="First Name" type="title" />
        <AppointmentForm.TextEditor
          value={appointmentData.PatienInfo}
          onValueChange={onFirstNameFieldChange}
          placeholder="First Name"
        />
      </AppointmentForm.BasicLayout>
    )
  }
  const creerRendezVousIndiv = (appointement) => {
    setTogglePross(true)
    const Time = moment(appointement.tempDebut, 'HH:mm')
      .add(1, 'hours')
      .format('HH:mm')
    const nextTime = moment(Time, 'HH:mm').add(30, 'minutes').format('HH:mm')
    const startDate = `${appointement.dateDebut}:${Time}`
    const endDate = `${appointement.dateDebut}:${nextTime}`
    setAppointementTitle(
      `Rendez Vous de ${appointement.student.nom} ${appointement.student.prenom}`
    )
    createRendezVousIndvMutation({
      variables: {
        data: {
          userId: appointement.student.id,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          description: appointement.description
        }
      }
    })
    console.log(
      `this is the user ${
        appointement.student.id
      } and the start date ${new Date(
        startDate
      ).toISOString()} and the end Date ${new Date(
        endDate
      ).toISOString()} and description ${appointement.description}`
    )
  }

  const currentDateChange = (currentDate) => {
    setCurrentDate(currentDate)
  }
  const commitChanges = ({ added, changed, deleted }) => {
    setAppointements((data) => {
      if (added) {
        const startingAddedId =
          data.length > 0 ? data[data.length - 1].id + 1 : 0
        data = [...data, { id: startingAddedId, ...added }]
      }
      if (changed) {
        data = data.map((appointment) =>
          changed[appointment.id]
            ? { ...appointment, ...changed[appointment.id] }
            : appointment
        )
      }
      if (deleted !== undefined) {
        data = data.filter((appointment) => appointment.id !== deleted)
      }
      console.log('this is the new added data ', data)
      return { data }
    })
  }

  // const []
  const dispatch = useDispatch()
  if (loadingStudentInfo || loadingLesNiveau) return <Loading />
  if (errorInNiveau || errorInStudentInfo) return <p>Error :(</p>
  return (
    <div className="calend__main">
      <div>
        <SideBar />
      </div>
      <div className="calend__container">
        <div className="header__container">
          <button
            className="btn__blue ml-auto d-flex align-items-center"
            onClick={() => dispatch(TypeRdvAction())}
            // onClick={() => console.log('this is the emails ', studentsAccount)}
          >
            <AddIcon className="mr-1" />
            <span>Crèer un rendez vous</span>
          </button>
        </div>

        <div>
          <Paper>
            <Scheduler data={appointements}>
              <ViewState
                defaultCurrentDate={currentDate}
                defaultCurrentViewName="Week"
                onCurrentDateChange={currentDateChange}
              />
              <EditingState onCommitChanges={commitChanges} />
              <IntegratedEditing />
              <DayView startDayHour={8} endDayHour={16} />
              <WeekView startDayHour={8} endDayHour={16} />

              <ConfirmationDialog />

              <Toolbar />
              <ViewSwitcher />
              <DateNavigator />
              <TodayButton />
              <Appointments />
              <AppointmentTooltip showOpenButton showDeleteButton />
              <AppointmentForm
                basicLayoutComponent={BasicLayout}
                textEditorComponent={TextEditor}
                messages={messages}
              />
            </Scheduler>
          </Paper>
        </div>
      </div>
      <ChoisirRendezVous
        currentDate={currentDate}
        studentsAccount={studentsAccounts}
        onCreerRendezVousIndiv={creerRendezVousIndiv}
        toggleProgress={toggleProgress}
        lesAnneesDeLecole={lesAnneesDeLecole}
        choosedGroupe={choosedGroupe}
        OnInsertRendezVousCollectif={insertRendezVousCollectif}
      />
    </div>
  )
}

export default Calend
