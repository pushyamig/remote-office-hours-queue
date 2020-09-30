import * as React from "react";
import { useState } from "react";
import { Alert, Button, Col, ListGroup, Nav, Row, Tab } from "react-bootstrap";

import {
    Breadcrumbs, checkForbiddenError, ErrorDisplay, FormError, LoadingDisplay, LoginDialog, RemoveButton, SingleInputField,
    StatelessInputGroupForm, UserDisplay
} from "./common";
import { PageProps } from "./page";
import { AllowedBackendsForm } from "./meetingType";
import { usePromise } from "../hooks/usePromise";
import { User } from "../models";
import * as api from "../services/api";
import { redirectToLogin } from "../utils";
import { confirmUserExists, uniqnameSchema } from "../validation";


interface AddQueueTabProps {
    disabled: boolean;
    onSuccess: () => void;
}

interface GeneralTabProps extends AddQueueTabProps {
    backends: {[backend_type: string]: string};
    allowedMeetingTypes: Set<string>;
    onChangeAllowed: (allowed: Set<string>) => void;
}

function GeneralTab(props: GeneralTabProps) {
    return (
        <div>
            <h2>General</h2>
            <h3>Name</h3>
            <h3>Description</h3>
            <h3>Meeting Types</h3>
            <AllowedBackendsForm
                allowed={props.allowedMeetingTypes}
                backends={props.backends}
                onChange={props.onChangeAllowed}
                disabled={props.disabled}
            />
            <div className='mt-4'>
                <Button variant='primary' disabled={props.disabled} onClick={(e: any) => props.onSuccess()}>Next</Button>
                <Button className='ml-3' href='/manage/' variant='danger' disabled={props.disabled}>Cancel</Button>
            </div>
        </div>
    );
}

interface ManageHostsTabProps extends AddQueueTabProps {
    hosts: User[];
    onNewHost: (uniqname: string) => void;
    onChangeHosts: (hosts: User[]) => void;
}

function ManageHostsTab(props: ManageHostsTabProps) {
    const filterOutHost = (host: User) => props.hosts.filter((user: User) => user.id !== host.id);
    const hostsSoFar = props.hosts.map((host, key) => (
        <ListGroup.Item key={key}>
            <UserDisplay user={host} />
            <div className='float-right'>
                <RemoveButton
                    onRemove={() => props.onChangeHosts(filterOutHost(host))}
                    size='sm'
                    disabled={props.disabled}
                    screenReaderLabel='Remove Host'
                />
            </div>
        </ListGroup.Item>
    ))

    return (
        <div>
            <h2>Manage Hosts</h2>
            <h3>Add Hosts</h3>
            <p>You have been added to the list of hosts automatically. Add additional hosts here.</p>
            <Alert variant='primary'>
                <strong>Note:</strong> The person you want to add needs to have logged on to Remote Office Hours Queue
                at least once in order to be added.
            </Alert>
            <SingleInputField
                id="add_host"
                fieldComponent={StatelessInputGroupForm}
                placeholder="Uniqname..."
                buttonType='success'
                onSubmit={props.onNewHost}
                disabled={props.disabled}
                fieldSchema={uniqnameSchema}
                showRemaining={false}
            >
                + Add Host
            </SingleInputField>
            <h3>Remove Hosts</h3>
            <ListGroup>{hostsSoFar}</ListGroup>
            <div className='mt-4'>
                <Button variant='primary' disabled={props.disabled} onClick={(e: any) => props.onSuccess()}>Finish Adding Queue</Button>
                <Button className='ml-3' href='/manage/' variant='danger' disabled={props.disabled}>Cancel</Button>
            </div>
        </div>
    );
}


interface AddQueueEditorProps {
    disabled: boolean;
    backends: {[backend_type: string]: string};
    allowedMeetingTypes: Set<string>;
    onChangeAllowed: (allowed: Set<string>) => void;
    hosts: User[];
    onNewHost: (uniqname: string) => void;
    onChangeHosts: (hosts: User[]) => void;
    onTabsSuccess: () => void;
}

// https://react-bootstrap.github.io/components/tabs/#tabs-custom-layout
function AddQueueEditor(props: AddQueueEditorProps) {
    // Would like to use an enum or CV here, not sure I can with onSelect
    const [activeKey, setActiveKey] = useState('general' as string);
    const [navMessage, setNavMessage] = useState(null as string | null);

    const finishTabMessage = 'You must finish the current tab before proceeding to the next.'

    return (
        <Tab.Container
            id='add-queue-editor'
            defaultActiveKey='general'
            activeKey={activeKey}
            onSelect={(eventKey: string) => eventKey !== 'hosts' ? setActiveKey(eventKey) : setNavMessage(finishTabMessage)}
        >
            <Row>
                <Col sm={3}>
                    <Nav variant='pills' className='flex-column mt-4'>
                        <Nav.Item><Nav.Link eventKey='general'>General</Nav.Link></Nav.Item>
                        <Nav.Item><Nav.Link eventKey='hosts'>Manage Hosts</Nav.Link></Nav.Item>
                    </Nav>
                </Col>
                <Col sm={7}>
                    <h1>Add Queue</h1>
                    {navMessage ? <Alert variant='danger'>{navMessage}</Alert> : null}
                    <Tab.Content>
                        <Tab.Pane eventKey='general'>
                            <GeneralTab
                                disabled={props.disabled}
                                backends={props.backends}
                                allowedMeetingTypes={props.allowedMeetingTypes}
                                onChangeAllowed={props.onChangeAllowed}
                                onSuccess={() => {
                                    setActiveKey('hosts');
                                    if (navMessage) { setNavMessage(null) };
                                }}
                            />
                        </Tab.Pane>
                        <Tab.Pane eventKey='hosts'>
                            <ManageHostsTab
                                disabled={props.disabled}
                                hosts={props.hosts}
                                onNewHost={props.onNewHost}
                                onChangeHosts={props.onChangeHosts}
                                onSuccess={() => {}}
                            />
                        </Tab.Pane>
                    </Tab.Content>
                </Col>
            </Row>
        </Tab.Container>
    );
}


export function AddQueuePage(props: PageProps) {
    if (!props.user) {
        redirectToLogin(props.loginUrl);
    }

    // Set up basic state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [allowedMeetingTypes, setAllowedMeetingTypes] = useState(new Set() as Set<string>);
    
    const [hosts, setHosts] = useState([props.user] as User[]);

    const checkHost = async (uniqname: string): Promise<User> => {
        return await confirmUserExists(uniqname);
    }
    const [doCheckHost, checkHostLoading, checkHostError] = usePromise(
        checkHost,
        (value: User) => setHosts([...hosts].concat(value))
    );

    // Set up interactions
    const addQueue = async () => {
        if (!name) {
            throw new Error("Queue name is required.")
        }
    }
    // Queue Management Events?
    const [doAddQueue, addQueueLoading, addQueueError] = usePromise(addQueue);
    const isChanging = checkHostLoading;
    const errorSources = [
        {source: 'Add Queue', error: addQueueError},
        {source: 'Check User', error: checkHostError}
    ].filter(e => e.error) as FormError[];
    const loginDialogVisible = errorSources.some(checkForbiddenError);
    const errorDisplay = <ErrorDisplay formErrors={errorSources}/>

    const addQueueEditor = (
        <AddQueueEditor
            disabled={isChanging}
            allowedMeetingTypes={allowedMeetingTypes}
            backends={props.backends}
            onChangeAllowed={setAllowedMeetingTypes}
            hosts={hosts}
            onNewHost={doCheckHost}
            onChangeHosts={setHosts}
            onTabsSuccess={() => {}}
        />
    );

    return (
        <div>
            <LoginDialog visible={loginDialogVisible} loginUrl={props.loginUrl} />
            <Breadcrumbs currentPageTitle='Add Queue' />
            {errorDisplay}
            {addQueueEditor}
        </div>
    );
}