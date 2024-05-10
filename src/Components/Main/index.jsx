import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-dt/css/dataTables.dataTables.css';
import "bootstrap/dist/css/bootstrap.min.css"; // Bootstrap CSS
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import ReactDOMServer from "react-dom/server";

import styles from "./styles.module.css";

const Main = () => {
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => { clearForm(); setShow(true); setSuccess(''); setError(''); };
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [targetId, setTargetId] = useState('');

    const getAllContact = useCallback(async () => {
        try {
            const userId = localStorage.getItem("userId");
            const token = localStorage.getItem("token");
            const url = `https://mycontact-wvem.onrender.com/api/ronir/?id=${userId}`;

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            const res = await axios.get(url, config);
            setContacts(res.data);
        }
        catch (error) {
            if (
                error.response &&
                error.response.status >= 400 &&
                error.response.status <= 500
            ) {
                console.error(error.response.data.message);
            }
        }
    }, []);

    useEffect(() => {
        getAllContact();

        const handleEditClick = async (event) => {
            const id = event.target.id;

            if (id.startsWith('dataEdit_')) {
                let trElement = event.target.closest('tr');
                let name = trElement.querySelector('td:nth-child(1)').innerText;
                let email = trElement.querySelector('td:nth-child(2)').innerText;
                let phone = trElement.querySelector('td:nth-child(3)').innerText;
                setName(name);
                setEmail(email);
                setPhone(phone);
                setSuccess('');
                setError('');
                setTargetId(id);
                // handleShow();
                setShow(true);
            }
            else if (id.startsWith('dataDel_')) {
                try {
                    const userId = id.split('_')[1];
                    const token = localStorage.getItem("token");
                    const url = `https://mycontact-wvem.onrender.com/api/ronir/${userId}`;

                    const config = {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    };

                    const res = await axios.delete(url, config);
                    alert(res.data.message);
                    getAllContact();
                }
                catch (error) {
                    if (
                        error.response &&
                        error.response.status >= 400 &&
                        error.response.status <= 500
                    ) {
                        console.error(error.response.data.message);
                    }
                }
            }
        };

        document.addEventListener('click', handleEditClick);

        return () => {
            document.removeEventListener('click', handleEditClick);
        };
    }, [getAllContact]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        window.location.reload();
    };

    function setContacts(res) {
        let tableData = res.map(contact => ({
            name: contact.name,
            email: contact.email,
            phone: contact.phone,
            action: ReactDOMServer.renderToString(
                <div className="d-flex justify-content-around">
                    <button className="btn btn-sm btn-outline-success" id={`dataEdit_${contact._id}`}>Edit</button>
                    <button className="btn btn-sm btn-outline-danger" id={`dataDel_${contact._id}`}>Delete</button>
                </div>
            )
        }));

        if ($.fn.DataTable.isDataTable("#contactsTable")) {
            $("#contactsTable").DataTable().destroy();
        }

        $("#contactsTable").DataTable({
            data: tableData,
            columns: [
                { title: "Name", data: "name" },
                { title: "Email", data: "email" },
                { title: "Phone", data: "phone" },
                { title: "Action", data: "action" }
            ],
            language: {
                emptyTable: "No data available in table"
            }
        });
    }

    const validateFields = () => {
        if (!name || !email || !phone) {
            setError('Please fill in all fields.');
            return false;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            setError('Please enter a valid email address.');
            return false;
        }

        const phonePattern = /^\d{10}$/;
        if (!phonePattern.test(phone)) {
            setError('Please enter a valid phone number (10 digits).');
            return false;
        }

        return true;
    };

    const handleSave = async () => {
        if (!validateFields()) {
            return;
        }

        try {
            const token = localStorage.getItem("token");
            const url = "https://mycontact-wvem.onrender.com/api/ronir/";

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            const data = { name, email, phone };

            const response = await axios.post(url, data, config);

            setSuccess(response.data.message);
            setError('');
            clearForm();
            getAllContact();
        } catch (error) {
            console.error(error);
            setSuccess('');
            setError('An error occurred. Please try again.');
        }
    };

    const handleEdit = async () => {
        if (!validateFields()) {
            return;
        }

        try {
            const contactId = targetId.split('_')[1];
            const token = localStorage.getItem("token");
            const url = `https://mycontact-wvem.onrender.com/api/ronir/${contactId}`;

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            const data = { name, email, phone };

            const response = await axios.put(url, data, config);

            setSuccess(response.data.message);
            setError('');
            clearForm();
            getAllContact();
        } catch (error) {
            console.error(error);
            setSuccess('');
            setError('An error occurred. Please try again.');
        }
    };

    const clearForm = () => {
        setName('');
        setEmail('');
        setPhone('');
        setTargetId('');
    };

    return (
        <div className={styles.main_container}>
            <nav className={styles.navbar}>
                <h1>Contact book</h1>
                <button className={styles.white_btn} onClick={handleLogout}>
                    Logout
                </button>
            </nav>
            <div className="d-flex justify-content-center">
                <div className="col-8 mt-2">
                    <p className="m-0 w-100" style={{ textAlign: 'end' }}>
                        <span
                            className="btn btn-sm btn-success"
                            variant="primary" onClick={handleShow}>
                            Add Contact
                        </span>
                    </p>
                    <table id="contactsTable" className="table table-striped table-bordered w-100">
                    </table>
                </div>
            </div>
            {/* Add & Edit Contact Modal */}
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Modal heading</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="name">
                            <Form.Label>Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="email">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="phone">
                            <Form.Label>Phone Number</Form.Label>
                            <Form.Control
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                            />
                        </Form.Group>
                    </Form>
                    {error && <Alert className="mb-0 mt-1" variant="danger">{error}</Alert>}
                    {success && <Alert className="mb-0 mt-1" variant="success">{success}</Alert>}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={handleClose}>
                        Close
                    </Button>
                    {targetId.startsWith('dataEdit_') ? (
                        <Button variant="info" onClick={handleEdit}>
                            Update
                        </Button>
                    ) : (
                        <Button variant="success" onClick={handleSave}>
                            Save
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Main;