import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { collecRdvAction } from '../redux/actions'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import '../assets/css/clend.css'
import { faCalendarDay, faUserPlus } from '@fortawesome/free-solid-svg-icons'

import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'

import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import Chip from '@material-ui/core/Chip'
import Autocomplete from '@material-ui/lab/Autocomplete'
import { useLazyQuery } from '@apollo/client'
import LoadingProgress from '../components/shared/loadingProgress'
import {
  GET_EMAILS_PAR_ANNEE_GROUPE,
  GET_LES_NIVEAU_DE_LECOLE
} from '../graphql/queries/GET_RENDEZVOUS_INFOS'

const RendezVousCollectif = (props) => {
  const [loadEmailParGroupe, response] = useLazyQuery(
    GET_EMAILS_PAR_ANNEE_GROUPE,
    {
      onCompleted: (data) => {
        const {
          allUserAccounts: { nodes }
        } = data
        const prevGroupeEmails = [...groupeEmails]
        const index = prevGroupeEmails.findIndex(
          (groupe) => groupe.niveau === choosedYear.niveau
        )
        if (index === -1) {
          // console.log('the index ', index)
          prevGroupeEmails.push({
            niveau: choosedYear.niveau,
            groupes: [
              {
                num: choosedGroup,
                students: nodes
              }
            ]
          })
        } else {
          prevGroupeEmails[index].groupes.push({
            num: choosedGroup,
            students: nodes
          })
        }
        setShowedEmails(nodes)
        setGroupeEmails(prevGroupeEmails)
        setEmailsIsLoaded(false)
        console.log('this is the new ', prevGroupeEmails)
      },
      onError: (error) => {
        console.log('this is the error ', error)
      }
    }
  )
  const [showedEmails, setShowedEmails] = useState([])
  const [emailsIsLoaded, setEmailsIsLoaded] = useState(false)
  const [choosedGroup, setChoosedGroup] = useState()
  const [startDate, setStartDate] = useState(props.currentDate)
  const [startTime, setStartTime] = useState(props.currentTime)

  const [endDate, setEndDate] = useState(props.currentDate)
  const [endTime, setEndTime] = useState(props.nextTime)
  const [choosedStudents, setChoosedStudents] = useState([])

  const dispatch = useDispatch()
  const [choosedYear, setChoosedYear] = useState({
    groupes: []
  })
  const [groupeEmails, setGroupeEmails] = useState([])

  const toggleCollecRdvModal = useSelector(
    (collecRdv) => collecRdv.toggleCollecRdvModal
  )

  const handleGroupChange = ({ target: { value } }) => {
    if (value) {
      const INT_VALUE = parseInt(value)
      const test = []
      setChoosedGroup(INT_VALUE)
      const theGroupeEmails = [...groupeEmails]

      //console.log('the groupe variable 1', typeof test)

      const newType = theGroupeEmails.filter((annee) => {
        let group = null
        // groupe.niveau === choosedYear.niveau && groupe.group.num === INT_VALUE
        if (annee.niveau === choosedYear.niveau) {
          group = annee.groupes.find((groupe) => groupe.num === INT_VALUE)
          console.log('this is the group  ', group)
        }

        return group
      })

      setEmailsIsLoaded(true)

      loadEmailParGroupe({
        variables: {
          niveau: choosedYear.niveau,
          groupe: INT_VALUE
        }
      })
    }
  }
  const handleAnneeChange = (e, value) => {
    value ? setChoosedYear(value) : setChoosedYear({ groupes: [] })
    //
    // console.log('this is the choosed year ', value)
  }
  const handleChoosedStudents = (e, value) => {
    setChoosedStudents(value)
    // console.log('this is the choosed students ', value)
  }
  const useStyles = makeStyles((theme) => ({
    container: {
      display: 'flex',
      flexWrap: 'wrap'
    },
    textField: {
      marginLeft: theme.spacing(1),
      marginRight: theme.spacing(1),
      maxWidth: 140
    },
    root: {
      width: 200,
      '& > * + *': {
        marginTop: theme.spacing(3)
      }
    }
  }))
  const classes = useStyles()

  const defaultProps = {
    options: props.lesAnneesDeLecole,
    getOptionLabel: (option) => option.title
  }
  return (
    <>
      <Modal
        isOpen={toggleCollecRdvModal}
        toggle={() => dispatch(collecRdvAction())}
        className={'content__container'}
        size="xl"
      >
        <ModalBody>
          <div className="d-flex flex-column justify-content-center">
            {emailsIsLoaded ? (
              <LoadingProgress text={'Chargement des emails'} />
            ) : null}
            <div className="title__container p-5">
              <h2>Crèer un Rendez Vous Collectif</h2>
            </div>
            <div className="groupe__container border__grey d-flex align-items-center mt-4">
              <Autocomplete
                style={{ width: 19 + 'vw' }}
                {...defaultProps}
                id="emailCollec"
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Choisir L'annèe"
                    margin="normal"
                  />
                )}
                onChange={handleAnneeChange}
              />

              <select
                className="select__groupe ml-3"
                name="Groupe"
                id="groupe"
                onChange={handleGroupChange}
              >
                <option value={null} key={0} defaultValue>
                  Choisir groupe
                </option>
                {choosedYear.groupes.map((groupe) => (
                  <option value={groupe} key={`${choosedYear.niveau}${groupe}`}>
                    Groupe {groupe}
                  </option>
                ))}
              </select>
            </div>
            <div className="timing__container d-flex mt-4 px">
              <div
                className="date__infos border__grey d-flex justify-content-center align-items-center"
                id="date__debut"
              >
                <span className="mt-3">Date dèbut :</span>
                <form className={classes.container} noValidate>
                  <TextField
                    id="dateDebutCollec"
                    label="Debut"
                    type="date"
                    defaultValue={props.currentDate}
                    className={classes.textField}
                    InputLabelProps={{
                      shrink: true
                    }}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </form>
              </div>
              <div
                className="date__infos border__grey d-flex justify-content-center align-items-center ml-3"
                id="temp__debut"
              >
                <span className="mt-3"> Temps dèbut :</span>
                <form className={classes.container} noValidate>
                  <TextField
                    id="tempsDebutCollec"
                    label="Alarm clock"
                    type="time"
                    defaultValue={props.currentTime}
                    className={classes.textField}
                    InputLabelProps={{
                      shrink: true
                    }}
                    inputProps={{
                      step: 300 // 5 min
                    }}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </form>
              </div>
              <div
                className="date__infos border__grey d-flex justify-content-center align-items-center ml-3"
                id="temp__debut"
              >
                <span className="mt-3"> Date fin :</span>
                <form className={classes.container} noValidate>
                  <TextField
                    id="dateFinCollec"
                    label="Debut"
                    type="date"
                    defaultValue={props.currentDate}
                    className={classes.textField}
                    InputLabelProps={{
                      shrink: true
                    }}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </form>
              </div>
              <div
                className="date__infos border__grey d-flex justify-content-center align-items-center ml-3"
                id="temp__debut"
              >
                <span className="mt-3"> Temps fin :</span>
                <form className={classes.container} noValidate>
                  <TextField
                    id="tempsFinCollec"
                    label="Alarm clock"
                    type="time"
                    defaultValue={props.nextTime}
                    className={classes.textField}
                    InputLabelProps={{
                      shrink: true
                    }}
                    inputProps={{
                      step: 300 // 5 min
                    }}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </form>
              </div>
            </div>
            <div className="student__info__container border__grey mt-1 px d-flex align-items-center ">
              <span id="userIconCollec" className="mt-3 mr-3">
                <FontAwesomeIcon icon={faUserPlus} />
              </span>
              {/* {console.log('this is les anee ', props.lesAnneesDeLecole)} */}
              <div className="student__email">
                <Autocomplete
                  multiple
                  id="studentEmailCollec"
                  options={showedEmails}
                  getOptionLabel={(option) => `${option.nom} ${option.prenom}`}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="standard"
                      label="Student Emails"
                      placeholder="Favorites"
                    />
                  )}
                  onChange={handleChoosedStudents}
                />
              </div>
            </div>
            <div className="create_btn_container d-flex justify-content-center align-items-center mt-4">
              <button
                className=""
                onClick={() => {
                  const appointement = {
                    startDate,
                    startTime,
                    endDate,
                    endTime,
                    choosedStudents
                  }
                  console.log('all infos ', appointement)
                  props.OnInsertRendezVousCollectif(appointement)
                }}
              >
                Crèer
              </button>
            </div>
          </div>
        </ModalBody>
      </Modal>
    </>
  )
}

export default RendezVousCollectif
